--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.categories (
    slug text NOT NULL,
    name text NOT NULL,
    collection_id integer NOT NULL,
    image_url text
);


ALTER TABLE public.categories OWNER TO "default";

--
-- Name: collections; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.collections (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public.collections OWNER TO "default";

--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collections_id_seq OWNER TO "default";

--
-- Name: collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.products (
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    subcategory_slug text NOT NULL,
    image_url text
);


ALTER TABLE public.products OWNER TO "default";

--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.subcategories (
    slug text NOT NULL,
    name text NOT NULL,
    subcollection_id integer NOT NULL,
    image_url text
);


ALTER TABLE public.subcategories OWNER TO "default";

--
-- Name: subcollections; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.subcollections (
    id integer NOT NULL,
    name text NOT NULL,
    category_slug text NOT NULL
);


ALTER TABLE public.subcollections OWNER TO "default";

--
-- Name: subcollections_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public.subcollections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subcollections_id_seq OWNER TO "default";

--
-- Name: subcollections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public.subcollections_id_seq OWNED BY public.subcollections.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO "default";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "default";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: collections id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);


--
-- Name: subcollections id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.subcollections ALTER COLUMN id SET DEFAULT nextval('public.subcollections_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: default
--


-- Small sample data for testing

COPY public.collections (id, name, slug) FROM stdin;
2	Drawing and Sketching	drawing-and-sketching
3	Painting Supplies	painting-supplies
4	Ink and Calligraphy	ink-and-calligraphy
5	Craft Supplies	craft-supplies
6	Printmaking and Stamping	printmaking-and-stamping
7	Sculpting and Model Making	sculpting-and-model-making
\.

COPY public.categories (slug, name, collection_id, image_url) FROM stdin;
erasers	Erasers	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/erasers-VTz6b5E0ZNe2V5Gs4JjvvRGMvsWmhm
inking-pens	Inking Pens	6	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/inking-pens-HfWBdaqugXDFP9YtT4xdZV6xyhHPCn
charcoal	Charcoal	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/charcoal-ERSDh71MNc3TVmOthFRSSIfUjjlOWy
pastels	Pastels	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/pastels-uAQE3LHSifZmF233ihS6RLfmSiFbdh
crayons	Crayons	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/crayons-UtPMcq0HTIXZGkhxDtHdXRZdxqNlk2
graphite-pencils	Graphite Pencils	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/graphite-pencils-NuYhnNwOQhgIZ288n4FefN4T2Oj8gZ
sketchbooks	Sketchbooks	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/sketchbooks-VJfVeMh0bY1ya6lFXQ5nTiY8gmnqRf
drawing-paper	Drawing Paper	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/drawing-paper-TIZtJqfrBO7ghRfu1KZxLgyKDHOc1j
ink	Ink	3	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/ink-HQ98OuZpuZrdXmuG0FcAKKXHFCZsKF
conte-crayons	Conte Crayons	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/conte-crayons-DKnK1SXHHtMZShTj9QFZ7ndbAFbDrj
drawing-boards	Drawing Boards	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/drawing-boards-IlDs2NKgNSN5MKCvFPiOklJoYzTLp4
blending-tools	Blending Tools	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/blending-tools-PhttC8l0OXOlbRHCa5ulGPFVNqy8Aq
sanguine	Sanguine	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/sanguine-YXOS5z0PkLsW0mz9MfDv107DsIdhuF
fixative-sprays	Fixative Sprays	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/fixative-sprays-owxmTGveP8FJ9c5jHBxEIOXqpsYcZF
calligraphy-supplies	Calligraphy Supplies	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/calligraphy-supplies-F5oZTH4qY2OQSTwQu1yAUYx7bepUBd
pastel-pencils	Pastel Pencils	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/pastel-pencils-hZYQUF73eIJsnh5f79p7ZkiAr4Uiet
gel-pens	Gel Pens	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/gel-pens-9PWj8RuFzeypVZVc05KIK9qghGxMWl
drawing-light-boxes	Drawing Light Boxes	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/drawing-light-boxes-9995M5jP8ClR1FPeeHesCxQJv4Ul0a
charcoal-paper	Charcoal Paper	5	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/charcoal-paper-rUIy2gnwWB3tymvvlT3TZeZDAno0WT
coloring-books	Coloring Books	6	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/categories/coloring-books-UUIWOQqVKQjPuuCsfe8C2jdmyAb6Gr
\.

COPY public.subcollections (id, name, category_slug) FROM stdin;
1	Sketching Pencils	graphite-pencils
2	Graphite Pencil Sets	graphite-pencils
3	Jumbo Graphite Pencils	graphite-pencils
4	Charcoal Graphite Pencils	graphite-pencils
5	Colored Graphite Pencils	graphite-pencils
7	Water-Soluble Graphite Pencils	graphite-pencils
9	Soft Graphite Pencils	graphite-pencils
10	Professional Graphite Pencils	graphite-pencils
16	Natural Charcoal	charcoal
22	Pan Pastels	pastels
\.

COPY public.subcategories (slug, name, subcollection_id, image_url) FROM stdin;
colored-pencils	Colored Pencils	1	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/colored-pencils-iexeMJxFT9wCY6J35n8pQYXDLUvQlY
art-marker-pencils	Art Marker Pencils	1	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/art-marker-pencils-mbHaAqVu4y4C3i3DevDJ3E9U36sBjP
hard-charcoal-pencils	Hard Charcoal Pencils	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/hard-charcoal-pencils-1R2uREWVQqgS91Qg4fNizqKkIPLM1d
charcoal-pencils	Charcoal Pencils	1	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/charcoal-pencils-L9UKmURa0gtZGpdvxKz6XHE6uZyJ1V
soft-charcoal-pencils	Soft Charcoal Pencils	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/soft-charcoal-pencils-UVDgLYhK04xXMH393Mr3BDRR7WluBr
medium-charcoal-pencils	Medium Charcoal Pencils	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/medium-charcoal-pencils-vxwbqk5XFvE3AfjMXyDnJag4g4BXzu
graphite-pencils	Graphite Pencils	1	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/graphite-pencils-8Y74t81zyLA4J9nzKM76HaLoJSeGPU
mechanical-pencils	Mechanical Pencils	1	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/mechanical-pencils-8CNR8YdBLf1tsZDfCe2UFarja5FZgq
specialty-charcoal-pencils	Specialty Charcoal Pencils	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/specialty-charcoal-pencils-al8Pibw4nCo4pxe5kZBJtqg2uyooy5
charcoal-drawing-sets	Charcoal Drawing Sets	4	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/charcoal-drawing-sets-TGLruIeahyjA6Ml5lWbR362BOGLjec
professional-drawing-sets	Professional Drawing Sets	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/professional-drawing-sets-HZLKGicBgu1QdFtrQ2XtUzbAhwRgf8
travel-sketching-sets	Travel Sketching Sets	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/travel-sketching-sets-zJyV1CMecnk7hsXFdAi0HLEOuImyK6
specialty-drawing-pencil-sets	Specialty Drawing Pencil Sets	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/specialty-drawing-pencil-sets-zo09ToQ7Mlw6UkhSaUYYtUEujEsuKL
sketching-pencil-sets	Sketching Pencil Sets	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/sketching-pencil-sets-z9ANm24Jhoru2GVN3hloapOJJwQLKw
standard-graphite-pencils	Standard Graphite Pencils	2	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/standard-graphite-pencils-SPfjc0TtiUHaUv8NO6mYF0Vuef2gtY
hard-lead	Hard Lead	3	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/hard-lead-qrE3CTDh4mpGIo80s0nNp38WaYiH6X
charcoal-infused	Charcoal Infused	3	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/charcoal-infused-ISC5PcbPHHKS6CQJNVTH8UzzJdRIP2
medium-lead	Medium Lead	3	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/medium-lead-V9ZEdLcUej19YnuyLXcHcVpilut0uL
water-soluble	Water-Soluble	3	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/water-soluble-Icc0hW4G6AuYzPmDetXpnQS3KNA3sj
soft-water-soluble-graphite-pencils	Soft Water-Soluble Graphite Pencils	7	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/subcategories/soft-water-soluble-graphite-pencils-LP3xNR5I6FfoAgk23j5pZeaOGG67Ta
\.

COPY public.products (slug, name, description, price, subcategory_slug, image_url) FROM stdin;
soft-lead-02	Jumbo Soft Graphite Pencil 4B	Perfect for darker and more intense shading, great for expressive drawings.	3.49	soft-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-lead-02-bC2wZopUKZBio5CkOQadZLmZH8TVor
standard-graphite-set-2	2B Graphite Pencil Set	Set of 10 2B graphite pencils for shading and sketching	14.99	standard-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/standard-graphite-set-2-riRH66t2yBN9FXlXFlgNREmGfzBM7l
sketching-set-6	Comics and Manga Set	Pencils suited for comic book and manga illustrations	27.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-6-DXMLnx4ygq39ZB7BYtkUj0Nq0AV9LY
sketching-set-7	Portrait Sketching Set	Pencils designed for portrait sketches and character studies	28.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-7-YKKHD0g0Kk35571We6ZUqFEHL9WVey
medium-lead-08	Jumbo Medium Graphite Pencil 3-Pack (HB, B, 2B)	Essential trio of medium lead pencils for professional artwork and drafting.	8.49	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-08-zVSAihcNdVP30Vx1umrOLZJsYdnEQQ
sketching-set-8	Urban Sketching Set	Pencils for on-the-go urban sketching and cityscapes	24.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-8-HCeJ79MfUwjedLalTBqT6EIjsxGF9B
soft-pencils-9	Soft Graphite Pencil Sharpener	Special sharpener for maintaining pencil tips.	3	soft-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencils-9-F3Xxpu3oCD8M0dCBZeSC1eGlb3F0Dd
soft-lead-06	Jumbo Soft Graphite Pencil Set (2B-6B)	Convenient set with various soft leads for versatile shading techniques.	12.99	soft-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-lead-06-vdDAUtBtaYPUZRcKSNRoBErioBjjNW
student-grade-3	Learning Artist Water-Soluble Graphite Pencil Collection	A variety of pencils for learning different techniques.	18	student-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/student-grade-3-6Tc6t2bdDKuVt9WQdQ8yXjJ5YWr5Et
soft-pencils-8	Soft Graphite Pencil Tin Case	Convenient storage for your soft graphite pencils.	5	soft-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencils-8-Mwd0REFKDbgN1j8X4FxZ7Rld76b5j6
student-grade-5	Junior Artist Water-Soluble Graphite Pencil Pack	Encourage young artists with this starter pack.	10	student-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/student-grade-5-yAgduVhgJqLoJfRZjfBo27jfoRlGvR
student-grade-6	Essentials Student Water-Soluble Graphite Pencil Set	Basic set for students learning graphite art.	8	student-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/student-grade-6-r6Q56T4NhMmKWC56X6PJdIMC64UqjE
student-grade-9	Art Club Water-Soluble Graphite Pencil Sampler	Try different pencils with this sampler pack.	14	student-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/student-grade-9-v2iwTenRHiCDKPuPVWhKjLvWD6H250
student-grade-8	Practice Makes Perfect Water-Soluble Graphite Pencil Kit	Kit to hone drawing skills with graphite.	25	student-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/student-grade-8-ag4IltdoSViuOa0HmX2Abw61N5YMaE
medium-charcoal-2	Medium Charcoal Pencil Set - 3 Pack	Set of 3 versatile medium charcoal pencils for different effects	9.99	medium-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-charcoal-2-my3MxRh9ImbrbKkJxQY7YJ1m8QDDVn
charcoal-drawing-1	Complete Charcoal Drawing Set	Comprehensive set with charcoal pencils, paper, and accessories for artists	34.99	charcoal-drawing-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/charcoal-drawing-1-2kFGrs9OODnofIaRZnK2Su4ZsNdJLc
hard-charcoal-3	Hard Charcoal Pencils - Value Pack	Value pack containing multiple hard charcoal pencils for artists	24.99	hard-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-charcoal-3-zefG8NZfbxcnQD7qrgkNb7ABPkqn4j
charcoal-drawing-2	Charcoal Sketching Kit - Beginner's Set	Starter kit with charcoal pencils, erasers, and tools for beginners	19.99	charcoal-drawing-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/charcoal-drawing-2-nWM8gXOWDV7YDiLDEj7JOkczQS3kDg
hard-charcoal-7	Hard Charcoal Artist Set - 10 Pieces	Professional artist set with various hard charcoal pencils for advanced drawings	32.99	hard-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-charcoal-7-MZYX9tNt3SCVY7um5H20FTOJWLV9GB
medium-charcoal-5	Medium Charcoal Pencil - 2H	Harder medium charcoal pencil for precise lines and details	3.99	medium-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-charcoal-5-88rNBGfhkw71hmZtMY0fJ9YLB69WEC
hard-charcoal-4	Hard Charcoal Sketching Set	Sketching set with hard charcoal pencils and accessories for professionals	29.99	hard-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-charcoal-4-rs8h5oy9jLKsirSd0yU5BFP7ih1boj
medium-charcoal-6	Medium Charcoal Pencil - 6B	6B graded medium charcoal pencil for dark, rich tones in drawings	4.49	medium-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-charcoal-6-BZdbsrMeiTVP7NPj1gzzJJtrsk3Dyw
professional-set-4	Illustrator's Dream Kit	Versatile pencils for illustrators with a variety of styles	46.99	professional-drawing-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/professional-set-4-GLS1yo2oyK8lFa0mgNeMrj3snLMUYQ
professional-set-10	Mixed Media Masterclass	Set of pencils perfect for mixed media artists and experimentalists	49.99	professional-drawing-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/professional-set-10-L4GnfsFvQM4u4g9FwPQUbugJ5ObZPk
hard-charcoal-1	Hard Charcoal Pencil - H	H graded hard charcoal pencil for light lines and details	3.99	hard-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-charcoal-1-F6lML24liezhL6SS9lvn6HkxQX9SgB
specialty-set-8	Glow-in-the-Dark Set	Pencils that glow in the dark for special effects and artworks	20.99	specialty-drawing-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-set-8-rQts9dtNnNhZUYEOKHnaZRC6HohMs8
standard-graphite-set-8	6H Graphite Pencil Set	Set of 10 6H graphite pencils for extremely light sketching	16.99	standard-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/standard-graphite-set-8-oJShMMSgDXQasOn92hW3ZDXv2f5biu
medium-charcoal-3	Medium Charcoal Pencils - Set of 7	Collection of 7 medium charcoal pencils in different grades for artists	18.99	medium-charcoal-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-charcoal-3-XizmWSEaZlnCQLgiWrd3X5LasYl1Ic
hard-lead-09	Jumbo Hard Graphite Pencil 4-Pack (3H, 4H, 5H, 6H)	Specialized set for technical professionals with varying lead hardness needs.	11.99	hard-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-lead-09-AonHtyqVmVFB0HmeX1AOylz6P0LAkT
medium-lead-10	Jumbo Medium Graphite Pencil Drawing Kit	Comprehensive collection for artists looking to explore various lead grades.	18.99	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-10-6wR0E7wf3QQ5kYhmm5OhQxiZD6nYhp
travel-set-1	Portable Sketching Essentials	Compact set for sketching on-the-go and while traveling	29.99	travel-sketching-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/travel-set-1-3Vb9yCsTPV39TxOtduf4r0RVe5EHnD
specialty-set-7	Marble Texture Pencil Set	Pencils with marbled texture for creating textured drawings	26.99	specialty-drawing-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-set-7-DIkZq4u6JIXR2BlcfwDiIOXr6p0cG7
specialty-set-9	Glass Effect Pencil Set	Pencils that mimic glass-like effects in drawings and designs	27.99	specialty-drawing-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-set-9-p08Zf2QMTz6w1dbgxlU3Vv4HT28nqk
specialty-set-10	Holographic Drawing Set	Pencils that create holographic and shimmering effects on paper	28.99	specialty-drawing-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-set-10-YJkcFTLVheEURuM9yOqbWsR7KrR61d
sketching-set-10	Mixed Media Sketch Set	Versatile pencils for mixed media artworks and experimental sketches	26.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-10-CUOAYwBsPREWKkpStjes0tjaNIQge2
standard-graphite-set-6	2H Graphite Pencil Set	Set of 10 2H graphite pencils for fine details and light sketching	14.99	standard-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/standard-graphite-set-6-MMVN4RGUPIbDEbouYoD2db7y1jlNBB
sketching-set-9	Landscape Drawing Set	Pencils for capturing scenic landscape views and natural beauty	25.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-9-8ZbKSStzZZrlhH0dOcBFuA5XlvW2Z4
hard-lead-03	Jumbo Hard Graphite Pencil 4H	Super hard graphite pencil ideal for technical drawing and intricate linework.	3.99	hard-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-lead-03-qvAKCqDgMpekhu3l5A3chSGykM8Dto
sketching-set-4	Nature Sketching Set	Earth-toned pencils for nature-inspired sketches and drawings	23.99	sketching-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sketching-set-4-GSZ4zMXM7AsrTgEPY9SvyoAuZl4dmy
standard-graphite-set-10	9H Graphite Pencil Set	Set of 10 9H graphite pencils for the lightest possible sketching	18.99	standard-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/standard-graphite-set-10-GcddWSKPgg2jlUcvdqLygfe0bMG03r
hard-lead-04	Jumbo Hard Graphite Pencil 5H	Premium quality hard lead pencil for architects and drafting professionals.	4.29	hard-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-lead-04-WRq863zsBGIf8c3Nn4XTXsH5tQMW9M
medium-lead-02	Jumbo Medium Graphite Pencil F	Light to medium darkness, perfect for fine lines and technical drawing.	2.99	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-02-2kruWJPj4Me0GqlVsNfFQUbRxzTgV4
medium-lead-01	Jumbo Medium Graphite Pencil HB	All-purpose pencil for everyday use, blending durability and dark tones.	2.49	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-01-uiOelxsbyeBcYJDgNt2lIjzC8mMTeY
charcoal-infused-03	Jumbo Charcoal Infused Graphite Pencil 6B	Offers intense dark tones with a charcoal-like texture, ideal for dramatic art.	4.49	charcoal-infused	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/charcoal-infused-03-dRioi1TrIEn8pHnefYeov01CacvenL
medium-lead-04	Jumbo Medium Graphite Pencil 2H	Extra hard lead suitable for detailed work requiring fine lines and control.	3.49	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-04-FccY1eLNYIuWShIcsfdonUAqH63j83
water-soluble-05	Jumbo Water-Soluble Graphite Pencil Set (4B-8B)	Set of water-soluble pencils for blending and creating washes in graphite art.	14.99	water-soluble	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/water-soluble-05-o5jSCDTu1dT3kgrqn8iwWaPG8IJNal
charcoal-infused-09	Jumbo Charcoal Infused Graphite Pencil Art Set	Complete art set for artists looking to experiment with charcoal-graphite combinations.	21.99	charcoal-infused	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/charcoal-infused-09-g0CkvsquemS1YgTUDpmMfENIQWKwfV
soft-lead-01	Jumbo Soft Graphite Pencil 2B	Ideal for shading and sketching, this soft lead pencil offers smooth application.	2.99	soft-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-lead-01-BlKo6uQb0CVwhCLLHC0oxvJaWBX0t6
water-soluble-06	Jumbo Water-Soluble Graphite Pencil Set (6B-10B)	Kit with dark water-soluble pencils for artists emphasizing rich tones and washes.	17.99	water-soluble	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/water-soluble-06-erPmBP2OG6TzcWNontNNA1agacDQR3
soft-lead-10	Jumbo Soft Graphite Pencil Sketching Kit	Complete set for beginners and professionals, perfect for sketching projects.	19.99	soft-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-lead-10-Xy2YNvE7cjV1K18a2sHizu1MlTdJQj
soft-lead-09	Jumbo Soft Graphite Pencil 4-Pack (HB, 2B, 4B, 6B)	Variety pack for intermediate shading needs, from light to dark tones.	10.99	soft-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-lead-09-2veNq4zt0KjPqz7fw5q0dSfMGw5hDs
medium-lead-07	Jumbo Medium Graphite Pencil Set (F, H, 2H, 4H)	Kit with a range of medium-hard lead pencils for technical illustrations.	12.99	medium-lead	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/medium-lead-07-pJCApiYIFJ64CU4KG4p9hIIgzybHYu
soft-pencils-1	Soft Graphite Pencil HB	Ideal for shading and light details.	5	soft-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencils-1-jx3HMKCvHeYH8tciNXdsgxRqyJPyFg
sets-9	Water-Soluble Graphite Pencil Accessories Kit	Includes essential tools for graphite art.	15	water-soluble-graphite-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sets-9-ffMSWJrogRvw5HSs3vnnnuzYvLBjyX
soft-pencils-5	Soft Graphite Pencil 8B	Deep shadows and rich contrasts.	9	soft-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencils-5-J2ot2ie9U1yGTr9YQk8OMw3cJihQ2e
sets-5	Water-Soluble Graphite Pencil Mixed Media Set	Combine graphite with other mediums.	35	water-soluble-graphite-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sets-5-UNOTxQZNcYouLKLx619obwYOxoWbwt
sets-10	Water-Soluble Graphite Pencil Beginner's Set	Starter set for those new to water-soluble pencils.	18	water-soluble-graphite-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sets-10-gbXDR1E4LkU44CsnPfW8h50RBMKmRV
artist-grade-1	Professional Water-Soluble Graphite Pencil HB	Premium pencil for professional artwork.	8	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-1-p1m4jKdhRoGlbqO6ZzhC9p8nKArIgg
hard-pencils-1	Hard Graphite Pencil 2H	For fine lines and detailed work.	5	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-1-z5rw96xNns0DWzhHKjfaEJZb80wFqH
artist-grade-7	Pro Water-Soluble Graphite Pencil Sharpener	Precision sharpener for professional use.	7	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-7-xUHXJygMO4fMOqV5CMyaypU5lpBqvE
artist-grade-8	Studio Water-Soluble Graphite Pencil Eraser	High-quality eraser for artists.	5	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-8-pHS2hAgAB8uaIpiPNK62Am6Oskggxl
hard-pencils-2	Hard Graphite Pencil H	Lighter shades with precise control.	6	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-2-Np2FYFELgnjv8F7XyuWpoMkxGW9PJC
artist-grade-10	Maestro Water-Soluble Graphite Pencil Extender	Extend the life of your premium pencils.	10	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-10-LlrwjyPCBKoDSKMdLWEIQIuB9aLLDz
artist-grade-9	Artisan Water-Soluble Graphite Pencil Blender	Blend graphite like a true artist.	8	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-9-mck7YYGMEjPsktUbtMitr0CaG5j0hM
hb-pencil-10	HB Pencil 10	HB pencil bulk pack for schools and offices	29.99	hb-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hb-pencil-10-mH6rRxwNVJFxIYsyRqvKp7kHHesdQM
4b-pencil-1	4B Pencil 1	4B pencil for rich, dark lines in drawing	2.99	4b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/4b-pencil-1-1B4LRN2H6dzZjDE78uolfG2vUZcVD7
4b-pencil-3	4B Pencil 3	4B pencil pack with varied graphite shades	12.99	4b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/4b-pencil-3-l5uoxgtDITvdB3BjhqTwxjHHDgxBkh
4b-pencil-9	4B Pencil 9	4B pencil with refillable lead for sustainability	6.49	4b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/4b-pencil-9-4MAV2UE7yNUZ4lDNFY1h5FQplnQmuv
2b-pencil-2	2B Pencil 2	Smooth 2B pencil for effortless writing	1.99	2b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/2b-pencil-2-iEbQN8EtEwAEmE6uBL0uRhyqktbCG2
hard-pencil-1	Drafting Pencil	Designed for precise technical drawings and drafts.	4.49	hard-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencil-1-OrbZB2bTsz3aTHYKtSreHhhs1w7dEh
2b-pencil-4	2B Pencil 4	2B pencil set of 6 for drawing enthusiasts	9.99	2b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/2b-pencil-4-ttrxw25VuSSFnqXhdODCYE4o2teCWp
6b-pencil-9	6B Pencil 9	6B pencil set with artist-quality lead	9.99	6b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/6b-pencil-9-mscMjkpIds1deal1IbD6pDheJPLD7n
6b-pencil-1	6B Pencil 1	6B pencil for intense shading and bold strokes	4.49	6b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/6b-pencil-1-ke8mPEJdty6YSeMLp4LGvWbTMewgc3
soft-pencil-5	Water-Soluble Graphite Pencil	Allows for unique watercolor effects in your art.	6.99	soft-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencil-5-jWDS8Gji7O4QRJH81K1wVymmFIpCdE
soft-pencil-1	Soft Sketching Pencil	Ideal for drawing and shading with a smooth lead.	3.99	soft-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencil-1-c6AImmKHFgxAWlz6x0ZT63ISTStbyR
choice-set-2	Artists' Favorite Graphite Collection	Curated selection of top-rated graphite pencils for artists.	34.99	artists-choice-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/choice-set-2-ewLewFvBp7NUSBcNSoQPeGbXcyoeCj
soft-pencil-10	Pocket-sized Graphite Pencils	Convenient for sketching on the go.	1.99	soft-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencil-10-nbJ1m7TxjEVS2Uzc5juBA3wRrjG54U
choice-set-1	Professional Sketching Bundle	Complete set of premium graphite pencils for professional artists.	39.99	artists-choice-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/choice-set-1-RJEl5OyE0zMGjKSrKPQext8koFPY7e
soft-pencil-6	Professional Grade 9B Pencil	Extra soft lead for creating deep contrasts.	7.99	soft-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencil-6-lL1q38NerpJoBxmsUb6zwbxpBiURtK
soft-pencil-8	Tinted Graphite Pencil Set	Adds a unique touch of color to your graphite art.	12.99	soft-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencil-8-D6LlrJKUBh6ZQBMGruHw9C1VOaZ3FT
artist-pastel-set-4	Pastel Elegance	Elegant pastels for sophisticated and refined art	59.99	artist-pastel-set	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-pastel-set-4-oB1A9ZpekSpa5XRb1LZU0GLjgmFdZj
soft-pencils-3	Soft Graphite Pencil 4B	Perfect for darker shading and texture work.	7	soft-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/soft-pencils-3-bgex2TU1ZaVmHJ02VSDMAfO6mDzMXB
sets-2	Water-Soluble Graphite Pencil Set (24 pcs)	Extended range for professional artists.	45	water-soluble-graphite-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sets-2-DEagGM7LJWNDnude1EeArdjM74h8Ip
hard-pencils-3	Hard Graphite Pencil 2H	Extra hard lead for crisp lines.	7	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-3-GtJQjb3d1Ub8HSGrDqyrcz6fReugRf
hard-pencils-8	Hard Graphite Pencil Blender	Tool for blending and smoothing hard graphite.	5	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-8-lwXBMuPvJ7c75uxuyWHsjLOisCmeJe
hard-pencils-10	Hard Graphite Pencil Storage Case	Protect and organize your hard pencils.	8	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-10-PRfIpxfxE9eiZOCpn4XdU96iqCdGJE
hard-pencils-7	Hard Graphite Pencil Eraser	Special eraser for hard graphite marks.	3	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-7-VevvgikKcbeTiVP5CrN23w0jjZL0Wp
hard-pencils-5	Hard Graphite Pencil 6H	Very light and precise details.	9	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-5-aIWwCU6kQq2EqIZdmZFnEdoa6vRRz3
artist-grade-3	Master Water-Soluble Graphite Pencil 6B	Ultimate dark shades with smooth blending.	10	artist-grade-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/artist-grade-3-BSAjHGWkn46iHAFwBHvd0i0FzsBcfT
hard-pencils-6	Hard Graphite Pencil Set (6 pcs)	A comprehensive range for detailed drawing.	30	hard-water-soluble-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hard-pencils-6-ijdu2qc4jQSvW6c58RmQF3YXboSdqJ
sets-4	Water-Soluble Graphite Pencil Drawing Kit	All-in-one set for drawing and shading.	40	water-soluble-graphite-pencil-sets	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/sets-4-8hwvoKZxYWRo81VhRIHBrJzdGHCSBc
hb-pencil-2	HB Pencil 2	Classic HB pencil with a comfortable grip	1.99	hb-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hb-pencil-2-fL7sk26331lPdvGLhdhE9Wkfr27Ke4
specialty-pencil-4	Jumbo Graphite Pencil	Extra thick pencil for bold sketches and shading.	7.99	specialty-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-pencil-4-Bw7jGAMNQxF6RqV1m5b6pDvcjc05DI
4b-pencil-8	4B Pencil 8	4B pencil bulk pack for art students	29.99	4b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/4b-pencil-8-38BxA0lJxpaChm7CNLJ4iifyekCHEI
hb-pencil-7	HB Pencil 7	HB pencil made from sustainable wood materials	2.99	hb-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/hb-pencil-7-NpBPWWyexhnmMZwLLSQv3m9fzSyOxm
muted-pencil-6	Muted Colored Graphite Pencil - Lavender Fields	Find serenity in the gentle lavender shades of this muted colored pencil.	2.49	muted-colored-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/muted-pencil-6-Aj0IenBLkGfWhZuc23uPEBNP4HtTX7
specialty-pencil-7	Graphite Pencil Assortment Pack	Assorted graphite pencils for experimenting with different tones.	10.99	specialty-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-pencil-7-QE5BcEKdocC0mMgSndRwKrymjemNjM
muted-pencil-10	Muted Colored Graphite Pencil - Desert Sands	Feel the warmth of desert sands in your artwork with this muted colored pencil.	2.99	muted-colored-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/muted-pencil-10-pIu0nTvAkcnyRzh7Izz7LpTpIZX3bu
2b-pencil-7	2B Pencil 7	2B pencil designed for smooth sketching	2.49	2b-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/2b-pencil-7-eYzMT0QmPpXw8kXC82PgLwjDcPgfDX
specialty-pencil-1	Watercolor Pencil Set	Graphite pencils that can be blended with water for watercolor effects.	11.99	specialty-graphite-pencils	https://bevgyjm5apuichhj.public.blob.vercel-storage.com/products/specialty-pencil-1-JnY2siVh0ns19bI3O0tasnoQhoM0fr
\.

-- Reset sequences
SELECT setval('public.collections_id_seq', (SELECT MAX(id) FROM public.collections));
SELECT setval('public.subcollections_id_seq', (SELECT MAX(id) FROM public.subcollections));
SELECT setval('public.users_id_seq', 1);
