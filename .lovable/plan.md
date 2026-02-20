

# Fix: Mobile Hamburger Menu Not Visible

## Root Cause

The `<nav>` element has `backdrop-blur-xl`, which in CSS creates a new **containing block** for any `fixed`-position descendants. This means the mobile overlay (which is inside the nav and uses `position: fixed`) is positioned relative to the 64px-tall nav bar instead of the full viewport.

With `top-[64px]` and `bottom-0` calculated against a 64px container, the overlay ends up with zero height -- invisible.

## Fix

Move the mobile overlay `<div>` **outside** the `<nav>` element so it is no longer affected by the nav's `backdrop-filter` containing block. The overlay will then correctly position itself against the viewport.

### File: `src/components/Navigation.tsx`

**Current structure:**
```
<nav className="fixed ... backdrop-blur-xl ...">
  <div> ... hamburger button ... </div>
  <div className="fixed ... top-[64px] bottom-0 ...">  <!-- OVERLAY TRAPPED -->
    ... mobile menu content ...
  </div>
</nav>
```

**New structure:**
```
<>
  <nav className="fixed ... backdrop-blur-xl ...">
    <div> ... hamburger button ... </div>
  </nav>
  <div className="fixed ... top-[64px] bottom-0 ...">  <!-- OVERLAY FREE -->
    ... mobile menu content ...
  </div>
</>
```

### Technical Details

- Wrap the return in a React Fragment (`<>...</>`)
- Close the `</nav>` tag before the mobile overlay div (line ~206)
- Move the mobile overlay div to be a sibling after `</nav>`
- No other changes needed -- all state, handlers, and styles remain identical

This is a single-file, ~3-line structural change with no logic modifications.

