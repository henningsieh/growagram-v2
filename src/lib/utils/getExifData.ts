import exifReader from "exif-reader";

interface ExifMetadata {
  bigEndian?: boolean;
  Image?: {
    ImageWidth?: number;
    ImageLength?: number;
    Make?: string;
    Model?: string;
    Orientation?: number;
    XResolution?: number;
    YResolution?: number;
    ResolutionUnit?: number;
    Software?: string;
    DateTime?: Date;
    YCbCrPositioning?: number;
    [key: string]: unknown;
  };
  Thumbnail?: {
    ImageWidth?: number;
    ImageLength?: number;
    Compression?: number;
    Orientation?: number;
    XResolution?: number;
    YResolution?: number;
    ResolutionUnit?: number;
    [key: string]: unknown;
  };
  Photo?: {
    ExposureTime?: number;
    FNumber?: number;
    ApertureValue?: number;
    ExposureProgram?: number;
    ISOSpeedRatings?: number;
    ExifVersion?: Buffer;
    DateTimeOriginal?: Date;
    DateTimeDigitized?: Date;
    OffsetTime?: string;
    OffsetTimeOriginal?: string;
    OffsetTimeDigitized?: string;
    [key: string]: unknown;
  };
  GPSInfo?: {
    GPSLatitudeRef?: string;
    GPSLatitude?: number[];
    GPSLongitudeRef?: string;
    GPSLongitude?: number[];
    GPSAltitudeRef?: number;
    GPSAltitude?: number;
    GPSTimeStamp?: number[];
    GPSDateStamp?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function getExifData(buffer: Buffer): Promise<{
  captureDate?: Date;
  make?: string;
  model?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  rawExif: ExifMetadata;
} | null> {
  try {
    // Check for JPEG SOI marker (0xFFD8)
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
      return null; // Not a JPEG file
    }

    // Find the APP1 marker (0xFFE1) which contains EXIF
    let offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] === 0xff && buffer[offset + 1] === 0xe1) {
        // Found EXIF marker
        const exifBuffer = buffer.slice(offset + 4); // Skip marker and length
        const exifData = exifReader(exifBuffer) as ExifMetadata;

        // Calculate GPS coordinates if available
        let gpsLocation:
          | { latitude: number; longitude: number; altitude?: number }
          | undefined;
        if (exifData.GPSInfo) {
          const {
            GPSLatitude,
            GPSLatitudeRef,
            GPSLongitude,
            GPSLongitudeRef,
            GPSAltitude,
            GPSAltitudeRef,
          } = exifData.GPSInfo;

          if (GPSLatitude && GPSLongitude) {
            const latitude = convertDMSToDD(GPSLatitude, GPSLatitudeRef);
            const longitude = convertDMSToDD(GPSLongitude, GPSLongitudeRef);

            gpsLocation = {
              latitude,
              longitude,
            };

            if (typeof GPSAltitude === "number") {
              gpsLocation.altitude =
                GPSAltitudeRef === 1 ? -GPSAltitude : GPSAltitude;
            }
          }
        }

        return {
          captureDate:
            exifData.Photo?.DateTimeOriginal ||
            exifData.Photo?.DateTimeDigitized ||
            exifData.Image?.DateTime,
          make: exifData.Image?.Make,
          model: exifData.Image?.Model,
          gpsLocation,
          rawExif: exifData,
        };
      }
      offset += 2 + (buffer[offset + 2] << 8) + buffer[offset + 3];
    }
    return null;
  } catch (error) {
    console.warn("Error reading EXIF data:", error);
    return null;
  }
}

// Helper function to convert GPS coordinates from DMS (Degrees, Minutes, Seconds) to DD (Decimal Degrees)
function convertDMSToDD(dms: number[], ref?: string): number {
  if (!dms || dms.length !== 3) return 0;

  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];

  let dd = degrees + minutes / 60 + seconds / 3600;

  // If ref is 'S' or 'W', make the coordinate negative
  if (ref === "S" || ref === "W") {
    dd = -dd;
  }

  return dd;
}
