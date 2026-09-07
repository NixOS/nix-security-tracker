/**
 * Constants used throughout the stroke generation algorithm.
 * @internal
 */
/**
 * Rate of change for simulated pressure.
 * Controls how quickly pressure changes based on drawing velocity.
 * Higher values make pressure more responsive to speed changes.
 */
export declare const RATE_OF_PRESSURE_CHANGE = 0.275;
/**
 * PI with a tiny offset to fix browser rendering artifacts.
 * Some browsers render strokes incorrectly when using exact PI.
 */
export declare const FIXED_PI: number;
/**
 * Number of segments for rounded start caps.
 */
export declare const START_CAP_SEGMENTS = 13;
/**
 * Number of segments for rounded end caps.
 * Higher than start caps for smoother appearance at stroke endings.
 */
export declare const END_CAP_SEGMENTS = 29;
/**
 * Number of segments for sharp corner caps.
 */
export declare const CORNER_CAP_SEGMENTS = 13;
/**
 * Pixels to skip at the end of a stroke to reduce noise.
 */
export declare const END_NOISE_THRESHOLD = 3;
/**
 * Minimum interpolation factor for streamline.
 * Used when streamline is at maximum (1.0).
 */
export declare const MIN_STREAMLINE_T = 0.15;
/**
 * Range for interpolation factor calculation.
 * Added to MIN_STREAMLINE_T based on (1 - streamline).
 */
export declare const STREAMLINE_T_RANGE = 0.85;
/**
 * Minimum stroke radius to prevent invisible strokes.
 */
export declare const MIN_RADIUS = 0.01;
/**
 * Default pressure for the first point of a stroke.
 * Lower than subsequent points to prevent fat starts,
 * since drawn lines almost always start slow.
 */
export declare const DEFAULT_FIRST_PRESSURE = 0.25;
/**
 * Default pressure for subsequent points when no pressure is provided.
 */
export declare const DEFAULT_PRESSURE = 0.5;
/**
 * Unit offset vector used as placeholder for initial vector
 * and for creating a second point when only one point is provided.
 */
export declare const UNIT_OFFSET: [number, number];
//# sourceMappingURL=constants.d.ts.map