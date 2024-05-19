package com.santosh.chatapplication.service;

import com.santosh.chatapplication.model.Status;
import com.santosh.chatapplication.model.User;
import com.santosh.chatapplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.santosh.chatapplication.model.Status.OFFLINE;
import static com.santosh.chatapplication.model.Status.ONLINE;

@Service
@RequiredArgsConstructor
public class UserService {


    @Autowired
    private UserRepository userRepository;


    public void saveUser(User user){
        user.setStatus(ONLINE);
        userRepository.save(user);
    }

    public void disconnectUser(User user){
        var storedUser = userRepository.findById(user.getName())
                .orElse(null);
        if(storedUser!=null){
            storedUser.setStatus(OFFLINE);
            userRepository.save(storedUser);
        }
    }

    public List<User> findConnectedUser(){
        return userRepository.findAllByStatus(ONLINE);
    }
}
