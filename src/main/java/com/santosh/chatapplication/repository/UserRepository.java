package com.santosh.chatapplication.repository;

import com.santosh.chatapplication.model.Status;
import com.santosh.chatapplication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status online);
}
