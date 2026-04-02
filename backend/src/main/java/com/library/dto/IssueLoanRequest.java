package com.library.dto;

import lombok.Data;

@Data
public class IssueLoanRequest {
    private Long bookId;
    private Long memberId;
}
