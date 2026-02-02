import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../colors/app_colors.dart';

/// Bouton moderne avec animations et effets visuels
class ModernButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Gradient? gradient;
  final bool isLoading;
  final bool isFullWidth;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final List<BoxShadow>? boxShadow;

  const ModernButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.backgroundColor,
    this.foregroundColor,
    this.gradient,
    this.isLoading = false,
    this.isFullWidth = true,
    this.height,
    this.padding,
    this.borderRadius,
    this.boxShadow,
  });

  @override
  State<ModernButton> createState() => _ModernButtonState();
}

class _ModernButtonState extends State<ModernButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: AppTheme.animationFast,
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _controller.forward();
  }

  void _onTapUp(TapUpDetails details) {
    _controller.reverse();
    if (widget.onPressed != null && !widget.isLoading) {
      widget.onPressed!();
    }
  }

  void _onTapCancel() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final button = Container(
      width: widget.isFullWidth ? double.infinity : null,
      height: widget.height ?? 56,
      padding: widget.padding,
      decoration: BoxDecoration(
        color: widget.gradient == null
            ? (widget.backgroundColor ?? AppColors.primary)
            : null,
        gradient: widget.gradient,
        borderRadius: BorderRadius.circular(
          widget.borderRadius ?? AppTheme.radiusMD,
        ),
        boxShadow: widget.boxShadow ??
            (widget.backgroundColor != null
                ? AppShadows.colored(
                    widget.backgroundColor ?? AppColors.primary,
                  )
                : AppShadows.md),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTapDown: _onTapDown,
          onTapUp: _onTapUp,
          onTapCancel: _onTapCancel,
          borderRadius: BorderRadius.circular(
            widget.borderRadius ?? AppTheme.radiusMD,
          ),
          child: Container(
            alignment: Alignment.center,
            child: widget.isLoading
                ? SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        widget.foregroundColor ?? Colors.white,
                      ),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(
                          widget.icon,
                          color: widget.foregroundColor ?? Colors.white,
                          size: 20,
                        ),
                        const SizedBox(width: AppTheme.spacingSM),
                      ],
                      Text(
                        widget.label.toUpperCase(),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: widget.foregroundColor ?? Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );

    return ScaleTransition(
      scale: _scaleAnimation,
      child: button,
    );
  }
}

/// Bouton secondaire (outlined)
class ModernOutlinedButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color? borderColor;
  final Color? textColor;
  final bool isLoading;
  final bool isFullWidth;

  const ModernOutlinedButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.borderColor,
    this.textColor,
    this.isLoading = false,
    this.isFullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: isFullWidth ? double.infinity : null,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppTheme.radiusMD),
        border: Border.all(
          color: borderColor ?? const Color(0xFFE0E0E0),
          width: 1.5,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
          child: Container(
            alignment: Alignment.center,
            child: isLoading
                ? SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        textColor ?? const Color(0xFF1A1A1A),
                      ),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        Icon(
                          icon,
                          color: textColor ?? const Color(0xFF1A1A1A),
                          size: 20,
                        ),
                        const SizedBox(width: AppTheme.spacingSM),
                      ],
                      Text(
                        label.toUpperCase(),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: textColor ?? const Color(0xFF1A1A1A),
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
