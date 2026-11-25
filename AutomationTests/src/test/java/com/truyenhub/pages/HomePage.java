package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class HomePage extends BasePage {
    private final By searchBox = By.cssSelector("input[placeholder='Tìm kiếm truyện...']");
    private final By titles = By.cssSelector(".card .card-title");
    private final By addToCart = By.xpath("//button[text()='Thêm vào giỏ']");
    private final By toast = By.cssSelector(".toast-body");

    public HomePage(WebDriver driver) {
        super(driver);
    }

    public void search(String title) {
        type(searchBox, title);
    }

    public List<String> comicTitles() {
        visible(titles);
        return driver.findElements(titles).stream().map(WebElement::getText).toList();
    }

    /** Tìm truyện rồi thêm vào giỏ, chờ thông báo thành công. */
    public void addComicToCart(String title) {
        search(title);
        wait.until(ExpectedConditions.numberOfElementsToBe(addToCart, 1));
        click(addToCart);
        wait.until(ExpectedConditions.textToBePresentInElementLocated(toast, "Đã thêm"));
    }
}
