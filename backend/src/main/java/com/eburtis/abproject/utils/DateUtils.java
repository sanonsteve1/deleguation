package com.eburtis.abproject.utils;


import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DateUtils {
	public static DateTimeFormatter FORMAT_HEURE = DateTimeFormatter.ofPattern("HH:mm");

	// formatte une date en dd/MM/yyyy
	
    public static String formatDate(String date) {
        try {
            // 1. Parser la chaîne "2020-01-01"
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date d = inputFormat.parse(date);

            // 2. Formatter en "MM/yyyy"
            SimpleDateFormat outputFormat = new SimpleDateFormat("MM/yyyy");
            return outputFormat.format(d);

        } catch (ParseException e) {
            e.printStackTrace();
            return "Date non valide";
        }
    }

	// formatte un statut
	public static String  formaStatut(String statut) {
        switch (statut) {
            case "EN_COURS":
                return "En cours";
            case "TERMINE":
                return "Terminé";
            case "ANNULE":
                return "Annulé";
            default:
                return statut;
        }
    }
}
