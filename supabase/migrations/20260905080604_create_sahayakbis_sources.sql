/*
# Create SahayakBIS verified source catalog

1. New Tables
- `sahayakbis_sources` stores the small, curated set of official BIS references used by the prototype.
- `id` is the stable UUID primary key.
- `title` is the human-readable source name.
- `url` is the official BIS page or document URL.
- `category` identifies `electronics`, `hallmarking`, or `general`.
- `citation` is the short citation shown in the app.
- `summary` is the plain-language description shown in the Sources view.
- `created_at` records when the source row was added.

2. Security
- Row level security is enabled.
- Anonymous and signed-in users can read the intentionally public catalog.
- Anonymous and signed-in users cannot insert, update, or delete source records.

3. Important notes
- The app only cites these curated official BIS sources in its prototype answers.
- The unique URL constraint keeps repeated seeding safe.
*/

CREATE TABLE IF NOT EXISTS public.sahayakbis_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('electronics', 'hallmarking', 'general')),
  citation text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sahayakbis_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read sources" ON public.sahayakbis_sources;
CREATE POLICY "public can read sources" ON public.sahayakbis_sources
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public cannot add sources" ON public.sahayakbis_sources;
CREATE POLICY "public cannot add sources" ON public.sahayakbis_sources
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "public cannot edit sources" ON public.sahayakbis_sources;
CREATE POLICY "public cannot edit sources" ON public.sahayakbis_sources
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "public cannot remove sources" ON public.sahayakbis_sources;
CREATE POLICY "public cannot remove sources" ON public.sahayakbis_sources
  FOR DELETE TO anon, authenticated USING (false);

INSERT INTO public.sahayakbis_sources (title, url, category, citation, summary) VALUES
  ('Indian Standards on LED', 'https://bis.gov.in/other/LEDSeries.pdf', 'electronics', 'BIS LED Series · IS 16102', 'Official list of Indian Standards for LED lamps, modules, control gear, measurements and luminaires.'),
  ('Hallmarking overview', 'https://www.bis.gov.in/hallmarking-overview?lang=en', 'hallmarking', 'BIS Hallmarking Overview', 'Explains purity testing, hallmarking centres and how the scheme protects precious-metal consumers.'),
  ('Hallmarking FAQs', 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq?lang=en', 'hallmarking', 'BIS Hallmarking FAQ · HUID', 'Confirms the three-part hallmark: BIS logo, purity/fineness and the six-digit alphanumeric HUID.'),
  ('Consumer protection', 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en', 'hallmarking', 'BIS Consumer Protection', 'Official guidance on using BIS CARE to verify a hallmarked gold jewellery item with its HUID.'),
  ('Product certification', 'https://www.bis.gov.in/product-certification/online-information/', 'general', 'BIS Product Certification', 'BIS information for manufacturers and applicants about product certification and online services.')
ON CONFLICT (url) DO NOTHING;