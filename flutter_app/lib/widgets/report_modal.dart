import 'package:flutter/material.dart';
import '../constants/theme.dart';

class ReportModal extends StatefulWidget {
  final String reporteeType; // 'user' or 'trip'
  final String reporteeName;
  final Function(String reason, String description) onSubmit;

  const ReportModal({
    Key? key,
    required this.reporteeType,
    required this.reporteeName,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<ReportModal> createState() => _ReportModalState();
}

class _ReportModalState extends State<ReportModal> {
  String? selectedReason;
  final descriptionController = TextEditingController();

  final reasons = [
    'Inappropriate behavior',
    'Cancellation without notice',
    'Safety concern',
    'Damaged vehicle',
    'Wrong destination',
    'Other',
  ];

  @override
  void dispose() {
    descriptionController.dispose();
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Report ${widget.reporteeType}',
              style: AppTypography.headingMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Help us improve safety by reporting issues',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Reason dropdown
            Text('Reason', style: AppTypography.labelLarge),
            const SizedBox(height: AppSpacing.sm),
            DropdownButtonFormField<String>(
              value: selectedReason,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              items: reasons
                  .map(
                    (reason) =>
                        DropdownMenuItem(value: reason, child: Text(reason)),
                  )
                  .toList(),
              onChanged: (value) => setState(() => selectedReason = value),
              validator: (value) =>
                  value == null ? 'Please select a reason' : null,
            ),
            const SizedBox(height: AppSpacing.lg),

            // Description
            Text('Description', style: AppTypography.labelLarge),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(
                hintText: 'Provide more details...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              maxLines: 4,
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
                    onPressed: selectedReason == null
                        ? null
                        : () {
                            widget.onSubmit(
                              selectedReason!,
                              descriptionController.text.trim(),
                            );
                            Navigator.pop(context);
                          },
                    child: const Text('Submit Report'),
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
