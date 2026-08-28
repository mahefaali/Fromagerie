package com.fromagerie_back.security;

import java.io.Serial;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;

public class CustomUserDetails implements UserDetails, CredentialsContainer {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String username;
    private final String nom;
    private final Role role;
    private final boolean actif;
    private String credentialHash;

    public CustomUserDetails(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.username = utilisateur.getUsername();
        this.nom = utilisateur.getNom();
        this.credentialHash = utilisateur.getCredentialHash();
        this.role = utilisateur.getRole();
        this.actif = utilisateur.isActif();
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public Role getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return credentialHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isEnabled() {
        return actif;
    }

    @Override
    public void eraseCredentials() {
        credentialHash = null;
    }
}
