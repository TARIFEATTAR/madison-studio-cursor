# Madison app — agent notes

## Product image pipeline — pixel sizes

| Stage | Dimensions | Ratio |
|-------|------------|--------|
| OpenAI raw output (`grid-images/output/openai/raw/*.png`) | 2000 × 2200 | 10:11 |
| Paper-doll composition canvas (`manifest` / `geometry_spec`) | 1000 × 1300 | 10:13 |
| Example Sanity CDN hero (paper-doll group) | 928 × 1152 | ~4:5 |

Constants: `src/config/productImageDimensions.ts`. Detail: `docs/product-image-system/pixel-contracts.md`.
