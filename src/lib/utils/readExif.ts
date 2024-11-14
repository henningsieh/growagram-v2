import ExifReader from "exifreader";

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

function parseExifDate(dateStr: string): Date | undefined {
  try {
    // EXIF dates are typically in format: "YYYY:MM:DD HH:MM:SS"
    // Convert to standard format: "YYYY-MM-DD HH:MM:SS"
    const standardDate = dateStr.replace(
      /^(\d{4}):(\d{2}):(\d{2})/,
      "$1-$2-$3",
    );
    const date = new Date(standardDate);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return undefined;
    }

    return date;
  } catch {
    return undefined;
  }
}

export async function readExif(buffer: Buffer): Promise<{
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
    // Load tags using ExifReader
    const tags = await ExifReader.load(buffer);

    // Remove MakerNote as it can be very large
    delete tags["MakerNote"];

    // Extract GPS data with proper type handling
    let gpsInfo: ExifMetadata["GPSInfo"] | undefined;

    if (tags["GPSLatitude"] && tags["GPSLongitude"]) {
      gpsInfo = {
        GPSLatitude: tags["GPSLatitude"].value as unknown as number[],
        GPSLatitudeRef: tags["GPSLatitudeRef"]?.value as string,
        GPSLongitude: tags["GPSLongitude"].value as unknown as number[],
        GPSLongitudeRef: tags["GPSLongitudeRef"]?.value as string,
        GPSAltitude:
          typeof tags["GPSAltitude"]?.value === "number"
            ? tags["GPSAltitude"].value
            : undefined,
        GPSAltitudeRef:
          typeof tags["GPSAltitudeRef"]?.value === "number"
            ? tags["GPSAltitudeRef"].value
            : 0,
      };
    }

    // Parse the date with proper error handling
    let dateTime: Date | undefined;
    if (tags["DateTime"]?.description) {
      dateTime = parseExifDate(tags["DateTime"].description);
    }

    // Map the ExifReader tags to our expected format
    const exifData: ExifMetadata = {
      Image: {
        Make: tags["Make"]?.description,
        Model: tags["Model"]?.description,
        DateTime: dateTime,
      },
      GPSInfo: gpsInfo,
    };

    // Calculate GPS location if coordinates are available
    let gpsLocation:
      | { latitude: number; longitude: number; altitude?: number }
      | undefined;
    if (gpsInfo?.GPSLatitude && gpsInfo?.GPSLongitude) {
      const latitude = convertDMSToDD(
        gpsInfo.GPSLatitude,
        gpsInfo.GPSLatitudeRef,
      );
      const longitude = convertDMSToDD(
        gpsInfo.GPSLongitude,
        gpsInfo.GPSLongitudeRef,
      );

      gpsLocation = {
        latitude,
        longitude,
      };

      if (typeof gpsInfo.GPSAltitude === "number") {
        gpsLocation.altitude =
          gpsInfo.GPSAltitudeRef === 1
            ? -gpsInfo.GPSAltitude
            : gpsInfo.GPSAltitude;
      }
    }

    return {
      captureDate: dateTime,
      make: exifData.Image?.Make,
      model: exifData.Image?.Model,
      gpsLocation,
      rawExif: exifData,
    };
  } catch (error) {
    console.error("Error reading EXIF data:", error);
    return null;
  }
}

// Helper function to convert GPS coordinates from DMS to DD
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
