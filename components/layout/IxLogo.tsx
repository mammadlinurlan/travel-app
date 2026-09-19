// ixTour brand logo — new raster wordmark (mark + "ixtour" text baked in,
// white text) supplied by the user in /public/new-logo.png. Designed for
// dark/navy backgrounds only, which is where it's used throughout the app.
const LOGO_SRC = "/new-logo.png";
const LOGO_ASPECT = 1884 / 835;

interface IxLogoProps {
  height?: number;
  className?: string;
}

export function IxLogo({ height = 32, className }: Readonly<IxLogoProps>) {
  const width = Math.round(height * LOGO_ASPECT);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset, no responsive sizing needed
    <img
      src={LOGO_SRC}
      alt="ixtour"
      width={width}
      height={height}
      className={className}
      style={{ height, width, objectFit: "contain" }}
    />
  );
}

/** Just the angular mark, cropped from the left of the same asset — used in compact/small spots. */
const MARK_LEFT_FRACTION = 0.06;
const MARK_WIDTH_FRACTION = 0.4;

export function IxMark({ height = 32, className }: Readonly<{ height?: number; className?: string }>) {
  const fullWidth = height * LOGO_ASPECT;
  const containerWidth = Math.round(fullWidth * MARK_WIDTH_FRACTION);
  return (
    <div
      className={className}
      style={{ width: containerWidth, height, overflow: "hidden", position: "relative" }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset crop, no responsive sizing needed */}
      <img
        src={LOGO_SRC}
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: -Math.round(fullWidth * MARK_LEFT_FRACTION),
          height,
          width: fullWidth,
          maxWidth: "none",
        }}
      />
    </div>
  );
}
