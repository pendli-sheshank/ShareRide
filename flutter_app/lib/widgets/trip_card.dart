import 'package:flutter/material.dart';
import '../models/trip_offer.dart';
import '../constants/theme.dart';

class TripCard extends StatelessWidget {
  final TripOffer trip;
  final VoidCallback? onTap;
  final VoidCallback? onJoin;

  const TripCard({Key? key, required this.trip, this.onTap, this.onJoin})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Route header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.origin,
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        trip.destination,
                        style: AppTypography.headingSmall.copyWith(
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                // Cost badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Text(
                    '₹${trip.costPerSeat}',
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Time and seats info
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  _formatTime(trip.departureTime),
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Icon(Icons.person, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  '${trip.seatsRemaining} seat${trip.seatsRemaining != 1 ? 's' : ''}',
                  style: AppTypography.bodySmall.copyWith(
                    color: trip.isFull
                        ? AppColors.error
                        : AppColors.textSecondary,
                  ),
                ),
              ],
            ),

            // Host info and join button
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                // Host avatar
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.surfaceVariant,
                  child: Text(
                    (trip.host?['display_name'] as String? ?? 'U')[0]
                        .toUpperCase(),
                    style: AppTypography.labelLarge,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.host?['display_name'] as String? ?? 'Unknown',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (trip.host?['average_rating'] != null)
                        Row(
                          children: [
                            Icon(Icons.star, size: 14, color: Colors.amber),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              '${trip.host?['average_rating']?.toStringAsFixed(1)}',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                if (!trip.isFull && onJoin != null)
                  ElevatedButton(onPressed: onJoin, child: const Text('Join')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
