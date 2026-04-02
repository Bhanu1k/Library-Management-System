package com.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private long totalBooks;
    private long totalMembers;
    private long activeLoans;
    private long overdueLoans;
    private List<?> recentLoans;
}
