# Platform Notes: uni-app

Key constraints and gotchas when using ArchonFlow with uni-app / Taro / mini-program targets.

## CSS Constraints

| Feature | Support | Workaround |
|---------|---------|------------|
| `position: fixed` | Partial — WeChat mini-program has known issues | Test on target platforms; use `uni.createSelectorQuery` |
| `backdrop-filter` | Not supported in mini-programs | Use semi-transparent background color |
| `filter: blur()` | Performance issues on mini-programs | Use pre-blurred image assets |
| `:has()` selector | Limited support | Use JavaScript-based selection |
| `>>>` / `/deep/` | Deprecated | Use `:deep()` (Vue 3) or `::v-deep` (Vue 2) |
| SVG | Varies across platforms | Use icon fonts or PNG fallbacks |

## API Constraints

| Web API | Mini-Program Equivalent |
|---------|------------------------|
| `window.innerWidth` | `uni.getSystemInfoSync().windowWidth` |
| `window.innerHeight` | `uni.getSystemInfoSync().windowHeight` |
| `localStorage` | `uni.setStorageSync` / `uni.getStorageSync` |
| `fetch` / `XMLHttpRequest` | `uni.request` |
| `document.querySelector` | `uni.createSelectorQuery` |

## VRT Considerations

- **Device Scale Factor**: Mini-programs typically use DPR 2 or 3; set `deviceScaleFactor` accordingly in VRT config
- **Font Rendering**: System fonts differ between iOS/Android/mini-program; use web-safe fonts or test on real devices
- **Screenshot Capture**: Playwright captures from H5 mode; for native mini-program rendering, use platform-specific screenshot tools
- **Masking**: Always mask dynamic content (timestamps, user avatars, ads) before VRT comparison

## Feasibility Check

The `feasibility-check.ts` script automatically flags uni-app platform constraints when `platform` is set to `uni-app` in `project.config.json`. Common flags:

- `backdrop-filter` → FAIL (not supported)
- `position: fixed` → WARNING (partial support)
- `window.*` APIs → FAIL (not available)
- SVG assets → WARNING (varies by platform)
