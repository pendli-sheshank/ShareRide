import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../constants/theme.dart';
import '../../providers/auth_provider.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;

  const OtpVerificationScreen({
    Key? key,
    required this.email,
  }) : super(key: key);

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final otpControllers = List.generate(6, (_) => TextEditingController());
  final focusNodes = List.generate(6, (_) => FocusNode());
  String? otpError;

  @override
  void dispose() {
    for (var controller in otpControllers) {
      controller.dispose();
    }
    for (var node in focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get otp => otpControllers.map((c) => c.text).join();

  void _onOtpDigitChanged(String value, int index) {
    if (value.isNotEmpty) {
      if (index < 5) {
        focusNodes[index + 1].requestFocus();
      } else {
        focusNodes[index].unfocus();
      }
    }
  }

  void _onBackspace(int index) {
    if (index > 0) {
      focusNodes[index - 1].requestFocus();
    }
  }

  void _verifyOtp() async {
    if (otp.length != 6) {
      setState(() {
        otpError = 'Please enter all 6 digits';
      });
      return;
    }

    setState(() {
      otpError = null;
    });

    // Verify OTP
    ref.read(otpVerificationProvider.notifier).verifyOtp(
      email: widget.email,
      token: otp,
    );
  }

  @override
  Widget build(BuildContext context) {
    final verifyState = ref.watch(otpVerificationProvider);

    // Navigate on successful verification
    ref.listen(otpVerificationProvider, (previous, next) {
      if (next.hasValue) {
        context.go('/');
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Verify Email'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.lg,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.md),

              // Heading
              Text(
                'Enter verification code',
                style: AppTypography.headingLarge.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'We sent a 6-digit code to ${widget.email}',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // OTP input fields
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 50,
                    height: 60,
                    child: TextField(
                      controller: otpControllers[index],
                      focusNode: focusNodes[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      decoration: InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          borderSide: const BorderSide(
                            color: AppColors.border,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          borderSide: const BorderSide(
                            color: AppColors.primary,
                            width: 2,
                          ),
                        ),
                      ),
                      style: AppTypography.headingMedium,
                      onChanged: (value) {
                        if (value.isEmpty) {
                          _onBackspace(index);
                        } else {
                          _onOtpDigitChanged(value, index);
                        }
                      },
                    ),
                  );
                }),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Error message
              if (otpError != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.error),
                    ),
                    child: Text(
                      otpError!,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ),

              if (verifyState.hasError)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.error),
                    ),
                    child: Text(
                      'Invalid code. Please try again.',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ),

              // Verify button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: verifyState.isLoading ? null : _verifyOtp,
                  child: verifyState.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : const Text('Verify'),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Resend code
              Center(
                child: TextButton(
                  onPressed: () {
                    context.pop();
                  },
                  child: Text(
                    'Didn\'t receive a code? Send again',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
