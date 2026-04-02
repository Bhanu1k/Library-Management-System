package com.library.service;

import com.library.model.Member;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
    }

    public Member addMember(Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new RuntimeException("A member with email '" + member.getEmail() + "' already exists.");
        }
        // Auto-set expiry to 1 year from today
        if (member.getJoinedDate() == null) member.setJoinedDate(LocalDate.now());
        if (member.getExpiryDate() == null) member.setExpiryDate(member.getJoinedDate().plusYears(1));
        return memberRepository.save(member);
    }

    public Member updateMember(Long id, Member memberDetails) {
        Member member = getMemberById(id);
        member.setName(memberDetails.getName());
        member.setEmail(memberDetails.getEmail());
        member.setPhone(memberDetails.getPhone());
        member.setAddress(memberDetails.getAddress());
        // Allow manual expiry date update
        if (memberDetails.getExpiryDate() != null) {
            member.setExpiryDate(memberDetails.getExpiryDate());
        }
        return memberRepository.save(member);
    }

    public void deactivateMember(Long id) {
        Member member = getMemberById(id);
        member.setStatus("INACTIVE");
        memberRepository.save(member);
    }

    // ── Renewal ──────────────────────────────────────────────────────────────
    // Renews membership by extending expiry by 1 year from today (or from
    // current expiry if it's still in the future — whichever is later).
    public Member renewMembership(Long id) {
        Member member = getMemberById(id);

        LocalDate base = (member.getExpiryDate() != null && member.getExpiryDate().isAfter(LocalDate.now()))
                ? member.getExpiryDate()
                : LocalDate.now();

        member.setExpiryDate(base.plusYears(1));
        member.setStatus("ACTIVE");
        return memberRepository.save(member);
    }

    // ── Auto-expire scheduler (runs every day at midnight) ────────────────
    @Scheduled(cron = "0 0 0 * * *")
    public void autoExpireMembers() {
        List<Member> expired = memberRepository.findExpiredActiveMembers(LocalDate.now());
        expired.forEach(m -> m.setStatus("EXPIRED"));
        memberRepository.saveAll(expired);
    }

    public List<Member> searchMembers(String query) {
        return memberRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public List<Member> getExpiringMembers(int withinDays) {
        LocalDate from = LocalDate.now();
        LocalDate to   = LocalDate.now().plusDays(withinDays);
        return memberRepository.findExpiringBetween(from, to);
    }
}