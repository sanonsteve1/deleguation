import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Carte moderne avec effet glassmorphism
class ModernCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final double? borderRadius;
  final List<BoxShadow>? boxShadow;
  final Gradient? gradient;
  final Border? border;

  const ModernCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.backgroundColor,
    this.borderRadius,
    this.boxShadow,
    this.gradient,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin ?? EdgeInsets.zero,
      padding: padding ?? const EdgeInsets.all(AppTheme.spacingLG),
      decoration: BoxDecoration(
        color: gradient == null 
            ? (backgroundColor ?? Colors.white)
            : null,
        gradient: gradient,
        borderRadius: BorderRadius.circular(
          borderRadius ?? AppTheme.radiusLG,
        ),
        border: border ?? Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: boxShadow ?? AppShadows.md,
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(
            borderRadius ?? AppTheme.radiusLG,
          ),
          child: card,
        ),
      );
    }

    return card;
  }
}

/// Carte avec effet glassmorphism
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final double opacity;
  final double? borderRadius;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.opacity = 0.95,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return ModernCard(
      padding: padding,
      margin: margin,
      onTap: onTap,
      gradient: AppGradients.glassWithOpacity(opacity),
      borderRadius: borderRadius,
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 20,
          spreadRadius: 1,
          offset: const Offset(0, 8),
        ),
      ],
      child: child,
    );
  }
}
