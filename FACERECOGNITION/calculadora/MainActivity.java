package com.example.calculadoradesumas;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    TextView numero1;
    TextView numero2;
    TextView resultado;
    Button boton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        numero1=findViewById(R.id.editTextNumber);
        numero2=findViewById(R.id.editTextNumber2);
        resultado=findViewById(R.id.textView4);
        boton=findViewById(R.id.button);

        boton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Integer numerotemp1= Integer.parseInt( numero1.getText().toString());
                Integer numerotemp2= Integer.parseInt( numero2.getText().toString());
                Integer resultadotemp = numerotemp1+numerotemp2;
                resultado.setText("el resultado es : "+ resultadotemp);
            }
        });


    }


}