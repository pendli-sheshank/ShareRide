import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../constants/theme.dart';
import '../../providers/trips_provider.dart';
import '../../providers/matches_provider.dart';

class TripDetailScreen extends ConsumerWidget {
  final String tripId;

  const TripDetailScreen({
    Key? key,
    required this.tripId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tripAsync = ref.watch(tripOfferProvider(tripId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: tripAsync.when(
        data: (trip) {
          if (trip == null) {
            return const Center(child: Text('Trip not found'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Route info
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Route',
                        style: AppTypography.headingSmall,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Text(
                              trip.origin,
                              style: AppTypography.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Padding(
                        padding: const EdgeInsets.only(left: 12.0),
                        child: SizedBox(
                          height: 30,
                          child: VerticalDivider(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            color: AppColors.error,
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Text(
                              trip.destination,
                              style: AppTypography.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),

                // Trip details
                Text(
                  'Trip Details',
                  style: AppTypography.headingSmall,
                ),
                const SizedBox(height: AppSpacing.md),
                _buildDetailRow('Departure', '${trip.departureTime.hour}:${trip.departureTime.minute.toString().padLeft(2, '0')}'),
                _buildDetailRow('Cost per seat', '₹${trip.costPerSeat}'),
                _buildDetailRow('Seats available', '${trip.seatsRemaining}/${trip.seatsAvailable}'),
                if (trip.womenOnly)
                  _buildDetailRow('Women only', 'Yes'),

                const SizedBox(height: AppSpacing.lg),

                // Host info
                Text(
                  'Host',
                  style: AppTypography.headingSmall,
                ),
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: AppColors.surfaceVariant,
                        child: Text(
                          (trip.host?['display_name'] as String? ?? 'U')[0]
                              .toUpperCase(),
                          style: AppTypography.headingMedium,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              trip.host?['display_name'] as String? ?? 'Unknown',
                              style: AppTypography.bodyMedium,
                            ),
                            if (trip.host?['average_rating'] != null)
                              Row(
                                children: [
                                  Icon(
                                    Icons.star,
                                    size: 14,
                                    color: Colors.amber,
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(
                                    '${trip.host?['average_rating']?.toStringAsFixed(1)}',
                                    style: AppTypography.bodySmall,
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                // Join button
                if (!trip.isFull)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _joinTrip(context, ref, trip),
                      child: const Text('Join This Ride'),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(
          child: Text('Error: $error'),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  void _joinTrip(BuildContext context, WidgetRef ref, trip) {
    ref.read(joinTripProvider.notifier).joinTrip(
      tripOfferId: trip.id,
      costPerRider: trip.costPerSeat.toDouble(),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Successfully joined trip!')),
    );
    context.pop();
  }
}
