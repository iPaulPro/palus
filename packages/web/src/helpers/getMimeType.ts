import {
  MediaAudioMimeType,
  MediaImageMimeType,
  MediaVideoMimeType
} from "@lens-protocol/metadata";
import { MediaAudioType, MediaImageType, MediaVideoType } from "@palus/indexer";

export const getMimeType = (
  mediaType: MediaAudioType | MediaVideoType | MediaImageType
): MediaAudioMimeType | MediaVideoMimeType | MediaImageMimeType => {
  switch (mediaType) {
    // Audio
    case MediaAudioType.AudioAac:
      return MediaAudioMimeType.AAC;
    case MediaAudioType.AudioFlac:
      return MediaAudioMimeType.FLAC;
    case MediaAudioType.AudioMp_4:
      return MediaAudioMimeType.MP4_AUDIO;
    case MediaAudioType.AudioMpeg:
      return MediaAudioMimeType.MP3;
    case MediaAudioType.AudioOgg:
      return MediaAudioMimeType.OGG_AUDIO;
    case MediaAudioType.AudioVndWave:
      return MediaAudioMimeType.WAV_VND;
    case MediaAudioType.AudioWav:
      return MediaAudioMimeType.WAV;
    case MediaAudioType.AudioWebm:
      return MediaAudioMimeType.WEBM_AUDIO;
    // Video
    case MediaVideoType.VideoMov:
      return MediaVideoMimeType.MOV;
    case MediaVideoType.VideoMp_4:
      return MediaVideoMimeType.MP4;
    case MediaVideoType.VideoMpeg:
      return MediaVideoMimeType.MPEG;
    case MediaVideoType.VideoOgg:
      return MediaVideoMimeType.OGG;
    case MediaVideoType.VideoOgv:
      return MediaVideoMimeType.OGV;
    case MediaVideoType.VideoWebm:
      return MediaVideoMimeType.WEBM;
    case MediaVideoType.VideoQuicktime:
      return MediaVideoMimeType.QUICKTIME;
    case MediaVideoType.VideoXm_4V:
      return MediaVideoMimeType.M4V;
    case MediaVideoType.ModelGltfBinary:
      return MediaVideoMimeType.GLTF_BINARY;
    case MediaVideoType.ModelGltfJson:
      return MediaVideoMimeType.GLTF;
    // Image
    case MediaImageType.Avif:
      return MediaImageMimeType.AVIF;
    case MediaImageType.Bmp:
      return MediaImageMimeType.BMP;
    case MediaImageType.Gif:
      return MediaImageMimeType.GIF;
    case MediaImageType.Heic:
      return MediaImageMimeType.HEIC;
    case MediaImageType.Jpeg:
      return MediaImageMimeType.JPEG;
    case MediaImageType.Png:
      return MediaImageMimeType.PNG;
    case MediaImageType.SvgXml:
      return MediaImageMimeType.SVG_XML;
    case MediaImageType.Tiff:
      return MediaImageMimeType.TIFF;
    case MediaImageType.Webp:
      return MediaImageMimeType.WEBP;
    case MediaImageType.XMsBmp:
      return MediaImageMimeType.X_MS_BMP;
  }
};
