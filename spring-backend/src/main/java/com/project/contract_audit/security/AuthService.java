package com.project.contract_audit.security;

import com.project.contract_audit.dto.AuthResponseDto;
import com.project.contract_audit.dto.LoginRequestDto;
import com.project.contract_audit.dto.SignupRequestDto;
import com.project.contract_audit.dto.SignupResponseDto;
import com.project.contract_audit.model.RefreshToken;
import com.project.contract_audit.model.User;
import com.project.contract_audit.repository.RefreshTokenRepository;
import com.project.contract_audit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthUtil authUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthResponseDto login(LoginRequestDto request){

        Authentication authentication =  authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        User user  = (User) authentication.getPrincipal();

        String accessToken = authUtil.generateAccessToken(user);


        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .build();

    }

    public SignupResponseDto signup(SignupRequestDto request){

        if(userRepository.findByUsername(request.username()).isPresent()){
            throw new IllegalArgumentException("User already exists");
        }

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .email(request.email())
                .fullname(request.fullname())
                .build();

        userRepository.save(user);

        return new SignupResponseDto(user.getId(), user.getUsername());
    }

    public AuthResponseDto refresh(String refreshTokenString){

        RefreshToken newToken = refreshTokenService.verifyAndRotate(refreshTokenString);

        User user = userRepository.findById(newToken.getUserId())
                .orElseThrow(()-> new IllegalArgumentException("User not found for refresh token"));

        String accessToken =  authUtil.generateAccessToken(user);

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(newToken.getToken())
                .userId(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .build();
    }

    public void logout(String refreshToken){
        refreshTokenService.deleteByToken(refreshToken);
    }





}
