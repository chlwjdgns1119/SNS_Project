import { join } from "path";

// 서버 프로젝트의 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();

// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';

// 포스트 이미지들을 저장할 폴더
export const POSTS_FOLDER_NAME = 'posts';

// 임시 저장할 폴더 이름
export const TEMP_FOLDER_NAME = 'temp';

// 실제 공개 폴더의 절대 경로
export const PUBLIC_FOLDER_PATH = join(
    PROJECT_ROOT_PATH,
    PUBLIC_FOLDER_NAME,
)

// 포스트 이미지를 저장할 폴더
export const POST_IMAGE_PATH = join(
    PUBLIC_FOLDER_NAME,
    POSTS_FOLDER_NAME,
)

// 실제로 이미지 위치를 get 요청에 담아서 보내줄 때는 절대 경로가 아닌 /public/post/xxx.jpg로 보내줌.
// 그러면 클라이언트에 앞에서 http://localhost:3000 /public/post/xxx.jpg 더해가지고 요청 보내게 해주면 이미지 보여줄 거임. 그래서 public/posts만 만들어줄거임.
export const POST_PUBLIC_IMAGE_PATH = join(
    PUBLIC_FOLDER_NAME,
    POSTS_FOLDER_NAME
)

// 임시 저장할 폴더 경로
export const TEMP_FOLDER_PATH = join(
    PUBLIC_FOLDER_PATH,
    TEMP_FOLDER_NAME,
)

