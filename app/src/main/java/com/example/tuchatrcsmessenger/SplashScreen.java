package com.example.tuchatrcsmessenger;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;

import com.example.tuchatrcsmessenger.Extensions.TinyDB;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import java.util.Objects;

public class SplashScreen extends AppCompatActivity {
    FirebaseAuth firebaseAuth;
    FirebaseUser firebaseUser;
    private final String FIRST_LAUNCH_KEY = "is_first_launch";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash_screen);

        firebaseAuth = FirebaseAuth.getInstance();
        firebaseUser = firebaseAuth.getCurrentUser();

        new CountDownTimer(1000, 1000) {

            public void onTick(long millisUntilFinished) {
                //Add code after every second
            }

            public void onFinish() {
                //Perform actions when timer is finished
                if (firebaseUser != null) {
                    //Add code to do if user is logged in
                    Intent mainActivity = new Intent(SplashScreen.this, MainActivity.class);

                    //Start next activity
                    startActivity(mainActivity);
                } else {
                    //Add code here if user is not logged in
                    Intent welcomeScreen = new Intent(SplashScreen.this, WelcomeScreen.class);

                    //Call new activity
                    startActivity(welcomeScreen);
                }
                //Finish current activity
                finish();

                //Animate transition into called activity
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left);
            }
        }.start();
    }

    private Boolean isFirstLaunch(){
        TinyDB tinyDB = new TinyDB(this);

        return tinyDB.getBooleanTrueDefault(FIRST_LAUNCH_KEY);
    }
}
