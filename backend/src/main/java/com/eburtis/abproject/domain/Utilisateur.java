package com.eburtis.abproject.domain;

import com.eburtis.abproject.enums.Role;
import com.eburtis.abproject.enums.StatutUtilisateur;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import static java.util.Collections.singleton;


@Entity
@Access(AccessType.FIELD)
@Table(name = Utilisateur.TABLE_NAME)
public class Utilisateur extends AbstractEntity {

	public static final String TABLE_NAME = "utilisateur";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	private String username;
	private String password;
	private String nom;
	private String prenoms;
	private String telephone;

	@Enumerated(EnumType.STRING)
	private Role role;

	@Enumerated(EnumType.STRING)
	private StatutUtilisateur statut;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_entreprise")
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private Entreprise entreprise;


	public User buildUser() {
		return new User(getUsername(), getPassword(), singleton(new SimpleGrantedAuthority(getRole().name())));
	}

	public Utilisateur() {

	}

	public Utilisateur(String username, String password, String nom, String prenoms, String telephone, Role role, StatutUtilisateur statut, Entreprise entreprise) {
		this.username = username;
		this.password = password;
		this.nom = nom;
		this.prenoms = prenoms;
		this.telephone = telephone;
		this.role = role;
		this.statut = statut;
		this.entreprise = entreprise;
	}

	public void mettreAjour(String nom, String prenoms, Role role, StatutUtilisateur statut) {
		this.nom = nom;
		this.prenoms = prenoms;
		this.role = role;
		this.statut = statut;
	}

	public Long getId() {
		return id;
	}

	public String getUsername() {
		return username;
	}

	public String getNom() {
		return nom;
	}

	public String getPrenoms() {
		return prenoms;
	}

	public String getTelephone() {
		return telephone;
	}

	public Role getRole() {
		return role;
	}

	public String getPassword() {
		return password;
	}

	public StatutUtilisateur getStatut() {
		return statut;
	}


	public void setPassword(String password) {
		this.password = password;
	}

	public void setStatut(StatutUtilisateur statut) {
		this.statut = statut;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public void mettreAJourUtilisateur(String username, String password, String nom, String prenoms, String telephone, Role role, StatutUtilisateur statut, Entreprise entreprise) {
		this.username = username;
		this.password = password;
		this.nom = nom;
		this.prenoms = prenoms;
		this.telephone = telephone;
		this.role = role;
		this.statut = statut;
		this.entreprise = entreprise;
	}

	public Entreprise getEntreprise() {
		return entreprise;
	}

	public void setEntreprise(Entreprise entreprise) {
		this.entreprise = entreprise;
	}

}

