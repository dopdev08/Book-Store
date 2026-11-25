package com.truyenhub.ui;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Mở Chrome mới cho mỗi test; test đỏ thì chụp màn hình vào target/screenshots. */
public class BaseUiTest {
    protected WebDriver driver;

    @BeforeMethod
    public void openBrowser() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--window-size=1280,900");
        if (Boolean.getBoolean("headless")) { // chạy với -Dheadless=true để không hiện cửa sổ
            options.addArguments("--headless=new");
        }
        driver = new ChromeDriver(options);
    }

    @AfterMethod(alwaysRun = true)
    public void closeBrowser(ITestResult result) throws IOException {
        if (driver == null) {
            return;
        }
        if (!result.isSuccess()) {
            Path folder = Files.createDirectories(Path.of("target", "screenshots"));
            byte[] image = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            Files.write(folder.resolve(result.getName() + ".png"), image);
        }
        driver.quit();
    }
}
