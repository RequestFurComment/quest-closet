# AI flow tests (interview streaming + recommendation) - slow, LLM serialized server-side
import json
import os
import subprocess
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
USER_B = "larp+test_userb@example.com"


@pytest.fixture(scope="module")
def b():
    s = requests.Session()
    tok = subprocess.check_output(["python", "/app/scripts/clerk_token.py", USER_B], text=True).strip()
    s.headers["Authorization"] = f"Bearer {tok}"
    return s


def _stream(s, iid, text, lang):
    r = s.post(f"{API}/interviews/{iid}/message", json={"text": text, "lang": lang}, stream=True, timeout=120)
    assert r.status_code == 200
    out, done = "", False
    for line in r.iter_lines(decode_unicode=True):
        if line and line.startswith("data: "):
            d = json.loads(line[6:])
            assert "error" not in d, d
            out += d.get("delta", "")
            done = done or d.get("done", False)
    assert done and out.strip()
    return out


class TestInterviewAI:
    def test_interview_and_recommend(self, b):
        b.put(f"{API}/profile", json={"lang": "en", "quebec_resident": True, "city": "Laval", "budget": 300})
        iv = b.post(f"{API}/interviews", json={}).json()
        q1 = _stream(b, iv["id"], "", "en")
        print("Q1:", q1[:200])
        _stream(b, iv["id"], "An elven ranger scout who uses a bow", "en")
        _stream(b, iv["id"], "Light leather armor, minimal makeup, I camp in a tent", "en")
        got = b.get(f"{API}/interviews/{iv['id']}").json()
        assert len(got["messages"]) == 5
        r = b.post(f"{API}/interviews/{iv['id']}/recommend", json={"categories": ["costumes", "weapons"], "lang": "en"}, timeout=120)
        assert r.status_code == 200, r.text
        look = r.json()
        print("LOOK:", look["concept_name"], look["item_ids"])
        cat = {p["id"]: p for p in requests.get(f"{API}/catalog").json()["products"]}
        assert look["concept_name"] and look["item_ids"]
        assert all(cat[i]["category"] in ("costumes", "weapons") for i in look["item_ids"])
        assert sum(cat[i]["price"] for i in look["item_ids"]) <= 300
        assert b.get(f"{API}/looks/{look['id']}").json()["flow"] == "interview"

    def test_interview_french(self, b):
        iv = b.post(f"{API}/interviews", json={}).json()
        q = _stream(b, iv["id"], "", "fr")
        print("FR:", q[:200])
        assert any(w in q.lower() for w in ("vous", "tu ", "ton ", "votre", "bienvenue", "personnage", "quel"))
