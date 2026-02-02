package com.eburtis.abproject.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;

public class DeviseUtils {
      private static final BigDecimal THOUSAND = BigDecimal.valueOf(1_000L);
    private static final BigDecimal MILLION  = BigDecimal.valueOf(1_000_000L);
    private static final BigDecimal BILLION  = BigDecimal.valueOf(1_000_000_000L); 
    

    public static String formatFCFA(BigDecimal amount, Locale locale) {
        if (amount == null) return "Montant invalide";

        boolean negative = amount.signum() < 0;
        BigDecimal abs = amount.abs();

        String suffix;
        BigDecimal valueToFormat;

        if (abs.compareTo(BILLION) >= 0) {
            suffix = "Mds"; 
            valueToFormat = abs.divide(BILLION, 1, RoundingMode.HALF_UP);
        } else if (abs.compareTo(MILLION) >= 0) {
            suffix = "M";
            valueToFormat = abs.divide(MILLION, 1, RoundingMode.HALF_UP);
        } else if (abs.compareTo(THOUSAND) >= 0) {
            suffix = "k";
            valueToFormat = abs.divide(THOUSAND, 1, RoundingMode.HALF_UP);
        } else {
            suffix = "";
            valueToFormat = abs.setScale(0, RoundingMode.HALF_UP);
        }

        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        if (nf instanceof DecimalFormat) {
            ((DecimalFormat) nf).setMaximumFractionDigits(1);
            ((DecimalFormat) nf).setMinimumFractionDigits(0);
            ((DecimalFormat) nf).setGroupingUsed(true);
        }

        String formattedNumber = nf.format(valueToFormat);

        if (formattedNumber.endsWith(",0") || formattedNumber.endsWith(".0")) {
            formattedNumber = formattedNumber.substring(0, formattedNumber.length() - 2);
        }

        String sign = negative ? "-" : "";
        String spaceBeforeCurrency = suffix.isEmpty() ? " " : " "; 
        String currency = "FCFA";

        return sign + formattedNumber + (suffix.isEmpty() ? "" : " " + suffix) + spaceBeforeCurrency + currency;
    }

    public static String formatFCFA(long amount) {
        return formatFCFA(BigDecimal.valueOf(amount), Locale.FRANCE);
    }

    public static String formatFCFA(BigDecimal amount) {
        return formatFCFA(amount, Locale.FRANCE);
    }
    public static String separerParMilliers(double montant) {

        DecimalFormat df = new DecimalFormat("#,###"); 
        String formatString = df.format(montant);
        return formatString;
    }

    public static double recupererMontant(String montantStr) {
        if (montantStr == null || montantStr.isEmpty()) {
            return 0;
        }
        try {
            return Double.parseDouble(montantStr.replace(" ", ""));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return 0;
        }
    }
    
    
}
