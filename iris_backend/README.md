# IRIS Backend — FastAPI

Backend for the IRIS Diabetic Retinopathy screening pipeline, built
against the schema in `iris_database_schema.sql` +
`migration_001_ground_truth.sql`, already live in Supabase.

## Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and paste your real Supabase connection string
```

## Run the API

```bash
uvicorn app.main:app --reload
```

- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Project structure

```
app/
  config.py       -> reads DATABASE_URL etc. from .env
  database.py     -> SQLAlchemy engine/session + get_db() dependency
  models.py       -> SQLAlchemy ORM models, one class per table
  schemas.py      -> Pydantic request/response schemas
  routers/
    patients.py    -> patient CRUD (soft-delete on DELETE)
    facilities.py  -> facility CRUD
    screenings.py  -> screening sessions + nested fundus images
    gradings.py    -> DR severity grading results (referable_flag
                       is server-computed, never trust client input)
    referrals.py   -> referral queue, sorted urgent-first
    lookups.py     -> read-only facility/role/lesion/status lookups
                       for populating frontend dropdowns
  main.py         -> app instance, CORS, router wiring
alembic/          -> migration environment (see below)
```

## Extending to the remaining tables

Not every table has a router yet — `districts`, `devices`, `users`,
`image_quality_assessments`, `segmentation_results`,
`explainability_reports`, `ophthalmologist_reviews`,
`ground_truth_*`, `model_validation_runs`, and `capacity_simulations`
all have models in `models.py` and are ready for CRUD, but don't have
endpoints yet since they're not needed for a first end-to-end walk
of the pipeline. Each new router follows the exact same shape as
`patients.py` — copy it, swap the model/schema names, adjust which
fields are filterable.

Suggested build order for the next batch: `image_quality_assessments`
and `segmentation_results` first (these are what your MATLAB pipeline
will actually write to), then `ground_truth_*` + `model_validation_runs`
once you're ready to run a benchmark.

## Database migrations (Alembic)

Your tables already exist in Supabase from the raw SQL files, so
Alembic needs to be told "the schema is already at this state"
rather than trying to create everything from scratch:

```bash
# Generate a migration that matches current models.py against nothing...
alembic revision --autogenerate -m "baseline"

# ...then tell alembic the DB is already here, without re-running
# the CREATE TABLE statements (which would fail, since they exist):
alembic stamp head
```

From that point on, any schema change should go through a normal
`alembic revision --autogenerate -m "..."` + `alembic upgrade head`,
so the whole team stays on the same schema instead of drifting via
manual `ALTER TABLE`s.

## A note on the `metadata` columns

Several tables (`facilities`, `patients`, `devices`, `fundus_images`,
`screening_sessions`) have a JSONB column literally named `metadata`
in Postgres. SQLAlchemy's declarative `Base` reserves `.metadata` as
a class attribute (it holds table definitions), so the ORM attribute
is named `metadata_` instead, mapped to the real `metadata` column —
see `models.py`. The Pydantic schemas mirror this with
`metadata_: ... = Field(alias="metadata")`, so the actual JSON API
still uses the field name `metadata` — this is purely an
ORM-internals workaround, not something API consumers need to know.
