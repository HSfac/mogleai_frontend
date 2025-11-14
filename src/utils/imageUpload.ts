import { api } from '@/lib/api';
import axios from 'axios';

/**
 * 이미지를 S3에 업로드합니다 (Presigned URL 방식)
 * @param file 업로드할 파일
 * @returns 업로드된 이미지 URL
 */
export async function uploadImageToS3(file: File): Promise<string> {
  try {
    // 1. Presigned URL 요청
    const { data } = await api.post('/upload/presigned-url', {
      fileName: file.name,
      fileType: file.type,
    });

    const { uploadUrl, fileUrl } = data;

    // 2. S3에 직접 업로드 (백엔드를 거치지 않음)
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    // 3. 최종 파일 URL 반환
    return fileUrl;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

/**
 * Base64를 File 객체로 변환
 * @param base64 Base64 문자열
 * @param fileName 파일 이름
 * @returns File 객체
 */
export function base64ToFile(base64: string, fileName: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}

/**
 * 이미지 파일 유효성 검사
 * @param file 검사할 파일
 * @param maxSizeMB 최대 크기 (MB)
 * @returns 에러 메시지 또는 null
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): string | null {
  // 파일 타입 체크
  if (!file.type.startsWith('image/')) {
    return '이미지 파일만 업로드 가능합니다.';
  }

  // 파일 크기 체크
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`;
  }

  return null;
}

/**
 * 이미지 미리보기 URL 생성
 * @param file 파일
 * @returns Promise<string> 미리보기 URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
