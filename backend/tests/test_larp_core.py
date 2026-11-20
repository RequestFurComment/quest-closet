# Core API regression tests for LARP gear shop (catalog, auth, profile, cart, looks, checkout, isolation)
import os
import subprocess
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
USER_A = "larp+clerk_test@example.com"
USER_B = "larp+test_userb@example.com"


def _token(email):
    return subprocess.check_output(["python", "/app/scripts/clerk_token.py", email], text=True).strip()


@pytest.fixture(scope="module")
def a():
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {_token(USER_A)}"
    return s


@pytest.fixture(scope="module")
def b():
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {_token(USER_B)}"
    return s


# --- Public / auth ---
class TestPublic:
    def test_profile_unauth_401(self):
        assert requests.get(f"{API}/profile").status_code == 401

    def test_catalog_public(self):
        r = requests.get(f"{API}/catalog")
        assert r.status_code == 200
        d = r.json()
        assert set(d["categories"]) == {"camping", "costumes", "makeup", "weapons"}
        assert len(d["products"]) == 24
        p = d["products"][0]
        assert p["name"]["fr"] and p["name"]["en"] and isinstance(p["price"], (int, float))

    def test_events_public(self):
        r = requests.get(f"{API}/events")
        assert r.status_code == 200
        ev = r.json()
        assert isinstance(ev, list) and len(ev) > 0
        assert all("source_url" in e and "last_checked" in e for e in ev)

    def test_events_refresh_requires_auth(self):
        assert requests.post(f"{API}/events/refresh").status_code == 401


# --- Profile (user B only) ---
class TestProfile:
    def test_put_get_profile(self, b):
        body = {"lang": "en", "quebec_resident": True, "city": "Laval", "gender": "woman",
                "height_cm": 170, "weight_kg": 65, "budget": 300}
        r = b.put(f"{API}/profile", json=body)
        assert r.status_code == 200, r.text
        g = b.get(f"{API}/profile").json()
        assert g["city"] == "Laval" and g["budget"] == 300 and g["quebec_resident"] is True
        assert "_id" not in g

    def test_invalid_lang(self, b):
        r = b.put(f"{API}/profile", json={"lang": "de", "quebec_resident": True})
        assert r.status_code == 400

    def test_invalid_height(self, b):
        r = b.put(f"{API}/profile", json={"quebec_resident": True, "height_cm": 10})
        assert r.status_code == 422

    def test_selfie_bad_type(self, b):
        r = b.post(f"{API}/profile/selfie", files={"file": ("a.txt", b"hello", "text/plain")})
        assert r.status_code == 400

    def test_selfie_upload_and_download(self, b):
        png = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4d40000000049454e44ae426082")
        r = b.post(f"{API}/profile/selfie", files={"file": ("s.png", png, "image/png")})
        assert r.status_code == 200, r.text
        path = r.json()["selfie_path"]
        d = b.get(f"{API}/files/{path}")
        assert d.status_code == 200 and d.content[:4] == b"\x89PNG"
        pytest.selfie_b = path


# --- Cart (user B) ---
class TestCart:
    def test_cart_put_add_clean(self, b):
        r = b.put(f"{API}/cart", json={"items": [{"product_id": "cos-wool-cloak", "qty": 2},
                                                 {"product_id": "bogus", "qty": 1}]})
        assert r.status_code == 200
        assert r.json()["items"] == [{"product_id": "cos-wool-cloak", "qty": 2}]
        r = b.post(f"{API}/cart/add", json={"product_ids": ["wp-dagger", "cos-wool-cloak"]})
        items = {i["product_id"]: i["qty"] for i in r.json()["items"]}
        assert items == {"cos-wool-cloak": 2, "wp-dagger": 1}
        assert b.get(f"{API}/cart").json()["items"] == r.json()["items"]

    def test_cart_bad_qty_string(self, b):
        r = b.put(f"{API}/cart", json={"items": [{"product_id": "wp-dagger", "qty": "abc"}]})
        assert r.status_code in (400, 422), f"got {r.status_code}"


# --- Looks + isolation ---
class TestLooks:
    def test_look_crud_and_isolation(self, a, b):
        r = b.post(f"{API}/looks", json={"item_ids": ["cos-wool-cloak", "wp-dagger", "nope"]})
        assert r.status_code == 200
        look = r.json()
        assert look["item_ids"] == ["cos-wool-cloak", "wp-dagger"] and look["preview_status"] == "none"
        lid = look["id"]
        assert b.get(f"{API}/looks/{lid}").json()["id"] == lid
        p = b.patch(f"{API}/looks/{lid}", json={"item_ids": ["wp-dagger"]})
        assert p.json()["item_ids"] == ["wp-dagger"]
        assert any(l["id"] == lid for l in b.get(f"{API}/looks").json())
        # isolation
        assert a.get(f"{API}/looks/{lid}").status_code == 404
        assert a.patch(f"{API}/looks/{lid}", json={"item_ids": []}).status_code == 404
        assert a.post(f"{API}/looks/{lid}/preview").status_code == 404
        assert all(l["id"] != lid for l in a.get(f"{API}/looks").json())

    def test_file_isolation(self, a):
        path = getattr(pytest, "selfie_b", None)
        if not path:
            pytest.skip("no selfie")
        assert a.get(f"{API}/files/{path}").status_code == 404

    def test_file_path_traversal(self, a):
        # user A must not read user B's selfie via ..%2F traversal
        path = getattr(pytest, "selfie_b", None)
        if not path:
            pytest.skip("no selfie")
        a_id = a.get(f"{API}/profile").json()["user_id"]
        app, rest = path.split("/", 1)
        r = a.get(f"{API}/files/{app}/{a_id}/..%2F{rest}")
        assert r.status_code in (400, 403, 404), f"traversal leaked file: {r.status_code}"

    def test_interview_isolation(self, a, b):
        iv = b.post(f"{API}/interviews", json={}).json()
        assert a.get(f"{API}/interviews/{iv['id']}").status_code == 404
        assert a.post(f"{API}/interviews/{iv['id']}/recommend", json={"categories": []}).status_code == 404


# --- Checkout (user B) ---
class TestCheckout:
    ship = {"name": "TEST Buyer", "line1": "123 Rue Test", "city": "Montréal", "province": "QC", "postal_code": "H2X 1Y4"}

    def test_non_quebec_postal(self, b):
        r = b.post(f"{API}/checkout", json={"origin_url": BASE_URL, "shipping": {**self.ship, "postal_code": "M5V 2T6"}})
        assert r.status_code == 400 and r.json()["detail"] == "quebec_only"

    def test_non_quebec_province(self, b):
        r = b.post(f"{API}/checkout", json={"origin_url": BASE_URL, "shipping": {**self.ship, "province": "ON"}})
        assert r.status_code == 400

    def test_quebec_checkout_session(self, b):
        b.put(f"{API}/cart", json={"items": [{"product_id": "wp-dagger", "qty": 1}]})
        r = b.post(f"{API}/checkout", json={"origin_url": BASE_URL, "shipping": self.ship, "lang": "en"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["checkout_url"].startswith("https://checkout.stripe.com") and d["session_id"].startswith("cs_test")
        st = requests.get(f"{API}/payments/status/{d['session_id']}").json()
        assert st["payment_status"] in ("pending", "unpaid")
        o = b.get(f"{API}/orders/{d['session_id']}")
        assert o.status_code == 200 and "_id" not in o.json()

    def test_empty_cart_checkout(self, b):
        b.put(f"{API}/cart", json={"items": []})
        r = b.post(f"{API}/checkout", json={"origin_url": BASE_URL, "shipping": self.ship})
        assert r.status_code == 400

    def test_orders_list(self, a):
        r = a.get(f"{API}/orders")
        assert r.status_code == 200 and isinstance(r.json(), list)
