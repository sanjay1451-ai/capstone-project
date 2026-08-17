package com.secondhand.electronics;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/testdb",
        "spring.datasource.hikari.initialization-fail-timeout=-1"
})
class ElectronicsTradingApplicationTests {

    @Test
    void contextLoads() {
        // Verifies context configuration loads successfully
    }
}
