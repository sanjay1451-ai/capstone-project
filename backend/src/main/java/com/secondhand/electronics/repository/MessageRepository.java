package com.secondhand.electronics.repository;

import com.secondhand.electronics.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdOrReceiverIdOrderByCreatedAtAsc(Long senderId, Long receiverId);

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :user1 AND m.receiverId = :user2) OR " +
           "(m.senderId = :user2 AND m.receiverId = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.isRead = false")
    long countUnreadMessages(@Param("receiverId") Long receiverId);
}
