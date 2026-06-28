import 'package:flutter/material.dart';
import '../constants/theme.dart';

class RatingModal extends StatefulWidget {
  final String rateeName;
  final Function(int rating, String? review) onSubmit;

  const RatingModal({Key? key, required this.rateeName, required this.onSubmit})
    : super(key: key);

  @override
  State<RatingModal> createState() => _RatingModalState();
}

class _RatingModalState extends State<RatingModal> {
  int rating = 5;
  final reviewController = TextEditingController();

  @override
  void dispose() {
    reviewController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(AppSpacing.lg),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Rate ${widget.rateeName}',
              style: AppTypography.headingMedium,
            ),
            const SizedBox(height: AppSpacing.lg),

            // Star rating
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return GestureDetector(
                  onTap: () => setState(() => rating = index + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                    ),
                    child: Icon(
                      Icons.star,
                      size: 40,
                      color: index < rating
                          ? Colors.amber
                          : AppColors.textTertiary,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Review text
            TextField(
              controller: reviewController,
              decoration: InputDecoration(
                hintText: 'Add a review (optional)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: AppSpacing.lg),

            // Buttons
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      widget.onSubmit(
                        rating,
                        reviewController.text.isEmpty
                            ? null
                            : reviewController.text,
                      );
                      Navigator.pop(context);
                    },
                    child: const Text('Submit'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
