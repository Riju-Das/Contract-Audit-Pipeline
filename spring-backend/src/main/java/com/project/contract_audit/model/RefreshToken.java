package com.project.contract_audit.model;
import org.springframework.data.annotation.Id;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Data
@Builder
@RedisHash(value="refresh_token" , timeToLive = 604800)
public class RefreshToken {

    @Id
    private String token;

    @Indexed
    private Long userId;
}
