import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {

        // [REQ] {요청 path} {요청 시간} 이런 식으로 로그가 간단하게 찍히도록 할 거임. 
        // 요청이 끝날 때 (응답이 나갈 대) 다시 타임스탬프를 찍을거임. [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms} 로 표시해줄거임.
        const req = context.switchToHttp().getRequest();


        const path = req.originalUrl;

        const now = new Date();
        
        console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

        // return next.handle()를 수행하는 순간 라우트의 로직이 전부 실행되고 응답이 Observable로 반환된다.
        return next
            .handle()
            .pipe(
                tap(
                    // [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
                    (observable) => console.log(`[REQ] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}`),
                ),
            )

    }
}