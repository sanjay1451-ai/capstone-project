package com.secondhand.electronics.repository;

import com.secondhand.electronics.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByProductId(Long productId);

    List<Report> findByReporterId(Long reporterId);

    List<Report> findByStatusOrderByCreatedAtDesc(String status);
}
