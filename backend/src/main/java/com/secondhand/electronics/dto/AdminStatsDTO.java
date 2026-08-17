package com.secondhand.electronics.dto;

public class AdminStatsDTO {

    private long totalUsers;
    private long totalProducts;
    private long activeListings;
    private long soldProducts;
    private long totalOrders;
    private long totalExchangeRequests;
    private long totalReports;
    private long pendingReports;

    public AdminStatsDTO() {
    }

    public AdminStatsDTO(long totalUsers, long totalProducts, long activeListings, long soldProducts, long totalOrders, long totalExchangeRequests, long totalReports, long pendingReports) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.activeListings = activeListings;
        this.soldProducts = soldProducts;
        this.totalOrders = totalOrders;
        this.totalExchangeRequests = totalExchangeRequests;
        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getActiveListings() {
        return activeListings;
    }

    public void setActiveListings(long activeListings) {
        this.activeListings = activeListings;
    }

    public long getSoldProducts() {
        return soldProducts;
    }

    public void setSoldProducts(long soldProducts) {
        this.soldProducts = soldProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalExchangeRequests() {
        return totalExchangeRequests;
    }

    public void setTotalExchangeRequests(long totalExchangeRequests) {
        this.totalExchangeRequests = totalExchangeRequests;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }
}
