# 😼 동물마켓  
[**[우리 동네 물물교환 마켓! 동물마켓의 백엔드 리포지토리에 오신 여러분을 환영합니다!]**](https://tristy.tistory.com/)  

**우리 동네 물물교환 마켓! 동물마켓!**

돈 없는 사람들도 중고 거래 하고 필요한 물품을 구할 수는 없을까?  
그런 당신을 동물 마켓이 도와드리겠습니다!  

<br/>
<br/>

[**[Fornt-End Github]**](https://github.com/hyemigwak/randomlunch)  
[**[Demo Video]**](https://www.youtube.com/watch?v=dYHfr0oWtcs&feature=youtu.be)  

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119868462-05c9b880-bf5a-11eb-9619-c6697f060f7c.jpg" width=50% ></p>
<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119868640-4295af80-bf5a-11eb-8f09-f25d272a63b9.jpg" width=50% ></p>


<br/>
<br/>

🤔 Team
-------------  
[Front-End] [곽혜미](https://github.com/hyemigwak), [이지은](https://github.com/Jinnycorn)  
[Back-End] 원동균, [이재윤](https://github.com/Leejaeyoon94)  

<br/>
<br/>


🤔 프로젝트 개요
-------------  
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>진행 날짜 - 2021.04.23 ~ 2021.05.28 </b></li>
<li><b>목적 - 팀원들과 함께, 백엔드와 프론트 엔드의 역할을 맡아 주제를 선정하고 프로젝트를 진행하자</b></li>
<li><b>필수 포함 사항</b></li>
</ul>

<br/>
<br/>

<p align="center"><img src="https://blog.kakaocdn.net/dn/dwsJdX/btq5vfsvhgR/Cpdc3RBItuKL8iKC9sh4k1/img.png"></p>


<br/>
<br/>


😎 Architecture
-----------------  

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119842034-4c5ee900-bf41-11eb-9164-c4bba92822f2.png"></p>


<br/>
<br/>

😎 ERD
-----------------  

<br/>
<br/>

채팅방 관리를 위해 채팅방 테이블, 채팅 테이블 유저, 채팅 메시지 테이블을 만들었습니다.  
또한 강퇴당한 사람 관리를 위해 강퇴 테이블도 만들었습니다.  

저희 saleItem 테이블에는 status라는 코드가 있는데 이를 위해서 code라는 공통 코드 관리 테이블을 만들어서  
언제든지 내용을 쉽게 바꿀 수 있도록 하였습니다.  

또한 saleItem row는 deadeLine 컬럼의 시간이 지나면 자동으로 status가 변경되어야 했기 때문에 아래의 이벤트를 적용했습니다.  

```sql
CREATE EVENT IF NOT EXISTS exchange_Fail ON SCHEDULE EVERY 1 HOUR STARTS '2021-05-20 00:00:00'
    ON COMPLETION NOT PRESERVE
    ENABLE
    COMMENT 'If the exchange is not made within the specified time, make it fail...'
    DO 
    UPDATE saleItem SET status = 'SI03' WHERE status = 'SI01' AND deadLine <= now();
```

<br/>
<br/>

<p align="center"><img src="https://user-images.githubusercontent.com/52685665/119867416-d6ff1280-bf58-11eb-9126-97937cf8221d.png"></p>

<br/>
<br/>



🤭 Nest Js   
-----------------

<br/>
<br/>

저희는 Nest Js를 사용해서 서비스를 구현하였습니다.  
하면서 가장 어려웠던 점은 일단 Nest Js 처음 사용하며 각종 예제들이 적었습니다.  
그래서 공식문서를 보면서 이해를 하였고 이해하지 못한 기술들은 **해외 블로그**에서 해답을 얻거나  
**StackOverFlow**에 물어보는 식으로 해결하였습니다.


<br/>

😭 Nestjs  어려웠던 점
-----------------  

<br/>
<br/>

### 1. Socket io 버전 차이 문제

백엔드와 프론트 엔드가 서로 소켓 통신이 완료된 상태였음에도, 브라우저에서 계속 빨갛게 SOCKET CONNECTION ERROR가 났습니다.  
[**공식문서**](https://socket.io/docs/v2)를 확인해보니 서버와 클라이언트의 소켓 버전이 일치해야 통신이 가능하다라는 것을 확인할 수 있었습니다.  
그래서 저희는 프론트엔드의 소켓 버전을 4에서 2로 다운그레이드 하여 해당 문제를 해결할 수 있었습니다.  

**왜 서버의 소켓 버전을 업그레이드 하지 않았습니까?**   
Nest Js에서 호환되는 최신 소켓 버전이 2.1.13이었기 때문이었습니다. (2021/05 기준)  

<br/>
<br/>

### 2. Socket io Auth 문제

저는 사용자 인증을 한 상태에서 소켓을 사용한 서비스를 제공하는 것이 옳다고 생각하여,   
socket io에서 jwt 인증을 사용할 수 있는 방법을 찾아다녔습니다.  

그렇게 2일을 찾아다니던 중에 외국에서 좋은 글을 볼 수 있었습니다.  
[**해당글**](https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/)에서는 원하는 데이터를 보내고 받기를 시작하기 전에, jwt 인증 알고리즘이 담긴 socket으로 먼저 통신한 다음  
그로부터 유효한 메시지를 받으면 그 이후에 emit을 시도하라는 것이었습니다.  

그래서 저는 다음과 같은 jwt 알고리즘이 담긴 인증 socket을 만들었고 socket과 관련한 인증 문제를 해결할 수 있었습니다.  
```javascript
	// 인증 하기
	@SubscribeMessage('authenticate')
	async handleAuthenticate(client: Socket, auth: string) {
		try {
			const [type, token] = auth['token'].split(' ');

			if (type != 'bearer') {
				return this.messageService.handleAuthenticateErr();
			}
			const payload = jwt.verify(token, process.env.SECRET_KEY);
			if (payload) {
				return this.messageService.returnSuccess();
			} else {
				return this.messageService.handleAuthenticateErr();
			}
		} catch {
			return this.messageService.handleAuthenticateErr();
		}
	}
```

<br/>
<br/>


🤭 Nginx   
-----------------

<br/>
<br/>

웹사이트의 동시접속 처리를 위해 Nginx를 사용하였습니다. 하지만 그 중요한 로드밸런싱 처리는 안돼 있습니다.  
저희가 프론트와 함께 채팅 기능을 구현하는데 너무 오랜 시간이 걸렸기 때문에 그런걸 신경쓸 시간이 없었답니다.  
더군다나, 중간에 설정을 잘못해 버려서 자꾸 cors 문제가 떳습니다.  

<br/>
<br/>

처음에는 해당 코드를 사용해서 nginx를 설정했습니다.  
그런데 이렇게 사용하였을 때 발생한 문제점의 꽤나 어메이징 했습니다.  


```bash
server {
            server_name dongmul.shop;
            location / {
                        proxy_hide_header Access-Control-Allow-Origin;
                        add_header 'Access-Control-Allow-Origin' '*';
                        proxy_set_header HOST $host;
                        proxy_pass https://127.0.0.1:3000;
                        proxy_redirect off;
           }

            listen 443 ssl;
            ssl_certificate /etc/letsencrypt/live/dongmul.shop/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/dongmul.shop/privkey.pem;
            include /etc/letsencrypt/options-ssl-nginx.conf;
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
            client_max_body_size 0;
}

# 80포트로 들어와도 443으로 꺾어줘야 돼
server {
            server_name dongmul.shop;
            listen 80;
            listen [::]:80;
            return 301 https://$host$request_uri;
}

```
  
<br/>
<br/>

😭 Nginx 어려웠던 점
-----------------  

<br/>
<br/>

### 1. proxy_hide_header로 인한 cors  

일단, 몇몇 api에서 cors 문제가 발생하였습니다. 다른 api는 잘 작동하는데 어떤 api 하나만 cors 문제가 떳습니다.  
그래서 문제를 찾는 것이 쉽지 않았습니다. 찾아보니 proxy_hide_header라는 녀석이  
클라이언트에게 숨길 헤더를 추가하는 기능을 하는데, 숨겨버리는 바람에 cors 문제가 발생한 것이 아닌가 싶습니다.  

실제로 해당 코드를 제거하니 cors 문제는 발생하지 않았습니다.  

<br/>
<br/>

### 2. add_header로 인한 문제 발생  

제가 착각을 했던게 Nginx를 사용하면, Nest js에서 cors를 해주고, Nginx에서도 한번 더 해줘야 한다고 생각했습니다.  
그래서 둘다 cors 처리를 해주었는데, 이렇게 하니까 Access-Control-Allow-Origin 헤더가 2개씩 올라가서 오류가 생겼습니다.  

우여곡절 끝에 문제점을 찾아내서 현재 저희 동물 마켓 Nginx 설정은 이렇게 되어 있습니다.  

```bash
server {
            server_name dongmul.shop;
            location / {
                        proxy_set_header HOST $host;
                        proxy_pass https://127.0.0.1:3000;
                        proxy_redirect off;
           }

            listen 443 ssl;
            ssl_certificate /etc/letsencrypt/live/dongmul.shop/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/dongmul.shop/privkey.pem;
            include /etc/letsencrypt/options-ssl-nginx.conf;
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
            client_max_body_size 0;
}

server {
            server_name dongmul.shop;
            listen 80;
            listen [::]:80;
            return 301 https://$host$request_uri;
}

``` 

아무래도 https 환경이고 Nginx도 처음 설정하는 것이다 보니, 엄청나게 오류가 많이 발생했습니다.  
프론트에서는 cors 문제가 발생하는데 nginx에는 어떤 로그도 안찍히는 경우도 있었고, 그러다보니 트러블 슈팅하는 것도  
엄청 오래 걸렸습니다 ㅠㅠ....  

소켓이랑 nginx 기본 설정하는 곳에서 트러블 슈팅하는거에 시간을 많이 뺏기지 않았다면 좀 더 많이 개발을 할 수 있었을 거란 생각이 듭니다.

<br/>
<br/>

🥵 이번 프로젝트에서 보완해야 할 점  
-----------------  

항해 99 최종 발표일날 해당 기능에 관한 피드백을 정리해보았습니다.  

<br/>
<br/>

### 1. mysql에 구현된 이벤트 제거  

현재 저희 mysql에는 1시간 마다 글들의 상태를 확인하고 바꾸는 이벤트가 구현되어 있습니다. 저는 Nest Js에서 mysql 서버를 열고 쿼리를 실행하고 mysql 서버를 다시 닫는 작업을 하는 것보다 이벤트를 구현하는 것이 더 빠를 것이라고 생각했습니다.  

이 기능에 대해 이벤트로 해당 기능을 구현해버리면 같은 팀원이 알 수가 없고, 1초마다 스케줄러가 돌아가는 것이 아니면  
속도 차이는 크게 나지 않는다는 피드백을 받을 수 있었습니다.  

실제로 해당 스케줄러의 코드를 저만 알고 있었기에 해당 피드백을 바꾸고 Nest js 스케줄러로 바꾸는 것으로 했습니다.  
만약 프로젝트 크기가 크고 스케줄러가 더 많았다면, 저 같아도 이해하기 힘들었을 것 같습니다. 

<br/>
<br/>


### 2. 서버 속도  

저희는 동물 마켓 설문지에서 " 채팅이 느리게 되는 것 같다 "라는 피드백을 보았습니다.  
그래서 저는 해당 현상이 mysql을 사용해서 채팅 서버를 구축했기 때문에 발생한 문제라고 생각했습니다.  

저도 채팅 기능을 처음 만들어봐서 mysql로 만들었는데, 좀 찾아보니 redis라는 데이터베이스를 사용해야 한다는 글을 볼 수 있었습니다.  

mysql이 채팅 데이터 저장은 보낼때마다 mysql을 열고 닫아야 해서 동시에 들어오는 메시지가 많으면 많아질수록 채팅 데이터가 손실될 우려가 있는 반면, redis의 경우에는 pub/sub을 사용해서 실시간으로 채팅 데이터를 저장할 수 있고, 메모리에서 실행되기 때문에 매우빠르고 충돌이 발생해도 데이터 손실이 발생하지 않는다고 합니다.  

그리고 Nest Js 공식문서를 확인해 보니, redis 채팅서버 지원을 더 많이 해주고 있었습니다.  


저희 동물 마켓은 이미 채팅서버를 mysql로 작업을 해두었기에 redis로 고치는 것은 시간이 너무 오래 걸릴 것 같았습니다.  
그래서 이에 관해 고민해 보던 중 좋은 피드백을 받을 수 있었습니다.

```
" 동물 마켓 같이 접속자 수가 별로 안되는 경우, mysql로 채팅 서버를 구축해도 속도에는 지장이 없으며 데이터 유실도 없을 것이다.  
아마 채팅이 느리게 되는 원인은 서버 속도 문제일 것이다. "
```

서버 속도에 관해서는 생각을 해본적이 없었는데, 이런 좋은 피드백을 주셔서 감사했습니다.  
모니터링 도구를 사용해서 서버 속도에 대한 여러 케이스에 대해 실험하고, 가장 최적의 속도를 찾아야 할 것 같습니다.  


<br/>
<br/>





