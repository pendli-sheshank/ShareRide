import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../constants/theme.dart';
import '../../providers/trips_provider.dart';
import '../../providers/matches_provider.dart';
import '../../widgets/trip_card.dart';

class MyRidesScreen extends ConsumerWidget {
  const MyRidesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myTripsAsync = ref.watch(myTripsProvider);
    final myMatchesAsync = ref.watch(myMatchesProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Rides'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Offered'),
              Tab(text: 'Joined'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Offered trips tab
            myTripsAsync.when(
              data: (trips) {
                if (trips.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.directions_car,
                          size: 64,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'No trips offered yet',
                          style: AppTypography.headingMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        ElevatedButton.icon(
                          onPressed: () {
                            DefaultTabController.of(context)?.animateTo(1);
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Post a Trip'),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => ref.refresh(myTripsProvider.future),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: trips.length,
                    itemBuilder: (context, index) {
                      final trip = trips[index];
                      return TripCard(
                        trip: trip,
                        onTap: () {
                          context.push('/trip/${trip.id}');
                        },
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stackTrace) => Center(
                child: Text('Error: $error'),
              ),
            ),

            // Joined matches tab
            myMatchesAsync.when(
              data: (matches) {
                if (matches.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.people,
                          size: 64,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'No rides joined yet',
                          style: AppTypography.headingMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => ref.refresh(myMatchesProvider.future),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: matches.length,
                    itemBuilder: (context, index) {
                      final match = matches[index];
                      final trip = match.tripOffer as Map<String, dynamic>?;

                      return Container(
                        margin: const EdgeInsets.only(bottom: AppSpacing.md),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        trip?['origin'] as String? ?? 'Route',
                                        style: AppTypography.bodyMedium
                                            .copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: AppSpacing.xs),
                                      Text(
                                        trip?['destination'] as String? ??
                                            'Destination',
                                        style: AppTypography.headingSmall,
                                      ),
                                    ],
                                  ),
                                ),
                                _buildStatusBadge(match.status),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '₹${match.costPerRider.toStringAsFixed(0)}',
                                  style: AppTypography.headingSmall.copyWith(
                                    color: AppColors.primary,
                                  ),
                                ),
                                if (match.isAccepted)
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      context.push('/chat/${match.id}');
                                    },
                                    icon: const Icon(Icons.chat),
                                    label: const Text('Chat'),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stackTrace) => Center(
                child: Text('Error: $error'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case 'pending':
        bgColor = Colors.amber.withOpacity(0.1);
        textColor = Colors.amber.shade700;
        break;
      case 'accepted':
        bgColor = AppColors.success.withOpacity(0.1);
        textColor = AppColors.success;
        break;
      case 'rejected':
        bgColor = AppColors.error.withOpacity(0.1);
        textColor = AppColors.error;
        break;
      case 'completed':
        bgColor = AppColors.primary.withOpacity(0.1);
        textColor = AppColors.primary;
        break;
      default:
        bgColor = AppColors.surfaceVariant;
        textColor = AppColors.textSecondary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Text(
        status.toUpperCase(),
        style: AppTypography.labelMedium.copyWith(
          color: textColor,
        ),
      ),
    );
  }
}
