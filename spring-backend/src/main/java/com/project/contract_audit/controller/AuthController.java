package com.project.contract_audit.controller;
import com.project.contract_audit.dto.AuthResponseDto;
import com.project.contract_audit.dto.LoginRequestDto;
import com.project.contract_audit.dto.SignupRequestDto;
import com.project.contract_audit.dto.SignupResponseDto;
import com.project.contract_audit.security.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    private void addRefreshTokenCookie(HttpServletResponse response , String token){
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .path("/")
                .secure(false)
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@Valid @RequestBody SignupRequestDto request){
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletResponse response
    ){

        AuthResponseDto authResponseDto = authService.login(request);

        addRefreshTokenCookie(response, authResponseDto.refreshToken());

        return ResponseEntity.ok(authResponseDto);

    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(
            @CookieValue(name="refreshToken") String refreshToken,
            HttpServletResponse response
    ){
        AuthResponseDto authResponseDto = authService.refresh(refreshToken);

        addRefreshTokenCookie(response, authResponseDto.refreshToken());

        return ResponseEntity.ok(authResponseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name="refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ){
        if(refreshToken != null){
            authService.logout(refreshToken);
        }

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .secure(false)
                .sameSite("None")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }


}
