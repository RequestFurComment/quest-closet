import os
from dotenv import load_dotenv
import stripe

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
from catalog import PRODUCTS  # noqa: E402


def ensure_tax():
    s = stripe.tax.Settings.retrieve()
    if not (s.head_office and getattr(s.head_office, "address", None)):
        stripe.tax.Settings.modify(
            head_office={"address": {"country": "CA", "line1": "1 Rue Sainte-Catherine O", "city": "Montréal",
                                     "state": "QC", "postal_code": "H2X 1Z5"}},
            defaults={"tax_behavior": "exclusive"},
        )
    regs = stripe.tax.Registration.list(status="active").data
    if not any(r.country == "CA" for r in regs):
        for opts in ({"type": "province_standard", "province_standard": {"province": "QC"}},
                     {"type": "standard"}):
            try:
                stripe.tax.Registration.create(country="CA", country_options={"ca": opts}, active_from="now")
            except stripe.error.StripeError as e:
                print("registration", opts["type"], e.user_message)


def get_or_create_product(p):
    for prod in stripe.Product.search(query=f"metadata['emergent_product_id']:'{p['id']}'").data:
        return prod
    return stripe.Product.create(name=p["name"]["en"], tax_code="txcd_99999999",
                                 metadata={"managed_by": "emergent", "emergent_product_id": p["id"]})


def main():
    ensure_tax()
    for p in PRODUCTS:
        prod = get_or_create_product(p)
        amount = int(round(p["price"] * 100))
        existing = stripe.Price.list(lookup_keys=[p["id"]], active=True, limit=1).data
        if existing and (existing[0].unit_amount != amount or existing[0].currency != "cad"):
            stripe.Price.modify(existing[0].id, active=False)
            existing = []
        if not existing:
            stripe.Price.create(product=prod.id, unit_amount=amount, currency="cad", lookup_key=p["id"],
                                transfer_lookup_key=True, tax_behavior="exclusive")
        print("ok", p["id"])
    print("regs", [(r.country, r.status) for r in stripe.tax.Registration.list().data])


if __name__ == "__main__":
    main()
