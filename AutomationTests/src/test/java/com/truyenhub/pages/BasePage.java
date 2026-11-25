package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/** Phần dùng chung của mọi trang: mở trang, chờ phần tử, thanh điều hướng. */
public class BasePage {
    private static final String URL = "http://localhost:5173";

    private final By userMenu = By.id("dropdown-user");

    protected final WebDriver driver;
    protected final WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void open(String path) {
        driver.get(URL + path);
    }

    protected WebElement visible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String text) {
        WebElement input = visible(locator);
        input.clear();
        input.sendKeys(text);
    }

    /** Chờ đến khi trình duyệt ở đúng đường dẫn. */
    public void waitForPath(String path) {
        wait.until(ExpectedConditions.urlToBe(URL + path));
    }

    public String loggedInName() {
        return visible(userMenu).getText();
    }
}
