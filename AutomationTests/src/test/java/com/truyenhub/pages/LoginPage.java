package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
    private final By email = By.cssSelector("input[placeholder='Email / Số điện thoại']");
    private final By password = By.cssSelector("input[placeholder='Mật khẩu']");
    private final By submit = By.cssSelector("form button[type='submit']");
    private final By error = By.cssSelector(".alert-danger");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void login(String emailText, String passwordText) {
        open("/login");
        type(email, emailText);
        type(password, passwordText);
        click(submit);
    }

    public String errorMessage() {
        return visible(error).getText();
    }
}
