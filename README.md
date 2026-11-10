# Quant Strata Business Advisory & Analytics

Official website source for Quant Strata LLC.

## Publishing

The deployable website is generated into `docs/` for GitHub Pages.

```bash
npm run build
```

GitHub Pages should be configured to publish from the `main` branch and `/docs` folder.

## Philadelphia Procurement Proof

The public-data application is maintained in `src/procurement/` and generated
at `/philadelphia-procurement-command-center/`, including its methodology brief.
Its multi-select contract-type controls support Professional Services and Public
Works simultaneously. Source stages and reporting periods remain distinct.

```bash
python3 scripts/refresh-procurement.py
npm run build
npm run test:procurement
```

Refresh is manual. The collector uses public sources without credentials,
checks PHLContracts pagination, and stops on a required-source failure.
The deployed snapshot is gzip-compressed and decoded by modern browsers.
Temporary source inputs are kept in the ignored `.work/` directory.
`npm run build:procurement` regenerates only the procurement application.
The full build retains the independently maintained finance proof and collateral.

See the in-app Sources & Coverage section for loaded periods and outstanding
coverage. Source row counts must not be represented as a distinct count of all
City contracts. Capital projects are a separate context layer; facility points
do not establish an open bid or a verified project footprint.

## Professional Boundaries

Quant Strata is a business consulting firm, not a CPA firm or law firm. Services do not include audits, attest services, legal opinions, or unauthorized representation before taxing authorities.
