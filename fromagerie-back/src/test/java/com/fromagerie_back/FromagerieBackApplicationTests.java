package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import com.fromagerie_back.config.DemoAccountSeeder;
import com.fromagerie_back.repository.UtilisateurRepository;

@SpringBootTest
class FromagerieBackApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Autowired
	private UtilisateurRepository utilisateurRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void demoAccountSeederIsAbsentWithoutDevelopmentProfile() {
		assertThat(applicationContext.getBeansOfType(DemoAccountSeeder.class)).isEmpty();
		assertThat(utilisateurRepository.existsByUsername(DemoAccountSeeder.OWNER_USERNAME)).isFalse();
		assertThat(utilisateurRepository.existsByUsername(DemoAccountSeeder.EMPLOYEE_USERNAME)).isFalse();
		assertThat(utilisateurRepository.existsByUsername(DemoAccountSeeder.SALES_USERNAME)).isFalse();
	}

}
