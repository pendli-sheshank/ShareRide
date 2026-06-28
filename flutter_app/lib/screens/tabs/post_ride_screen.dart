import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../constants/theme.dart';
import '../../providers/trips_provider.dart';

class PostRideScreen extends ConsumerStatefulWidget {
  const PostRideScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PostRideScreen> createState() => _PostRideScreenState();
}

class _PostRideScreenState extends ConsumerState<PostRideScreen> {
  final formKey = GlobalKey<FormState>();
  final originController = TextEditingController();
  final destinationController = TextEditingController();
  final costController = TextEditingController();
  final seatsController = TextEditingController();

  DateTime? departureTime;
  bool womenOnly = false;

  @override
  void dispose() {
    originController.dispose();
    destinationController.dispose();
    costController.dispose();
    seatsController.dispose();
    super.dispose();
  }

  Future<void> _selectDateTime(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (date != null) {
      if (mounted) {
        final time = await showTimePicker(
          context: context,
          initialTime: TimeOfDay.now(),
        );

        if (time != null) {
          setState(() {
            departureTime = DateTime(
              date.year,
              date.month,
              date.day,
              time.hour,
              time.minute,
            );
          });
        }
      }
    }
  }

  void _submitForm() {
    if (!formKey.currentState!.validate()) return;
    if (departureTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select departure time')),
      );
      return;
    }

    // TODO: Implement actual location coordinates
    // For now, use dummy coordinates
    final origin = originController.text.trim();
    final destination = destinationController.text.trim();

    ref
        .read(createTripProvider.notifier)
        .createTrip(
          origin: origin,
          destination: destination,
          originLat: 28.6139, // Dummy Delhi coordinates
          originLng: 77.2090,
          destLat: 28.7041,
          destLng: 77.1025,
          departureTime: departureTime!,
          costPerSeat: int.parse(costController.text),
          seatsAvailable: int.parse(seatsController.text),
          womenOnly: womenOnly,
        );

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Trip posted successfully!')));

    // Reset form
    formKey.currentState!.reset();
    setState(() {
      departureTime = null;
      womenOnly = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final createState = ref.watch(createTripProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Post a Ride')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Route section
              Text('Route', style: AppTypography.headingMedium),
              const SizedBox(height: AppSpacing.md),

              TextFormField(
                controller: originController,
                decoration: const InputDecoration(
                  hintText: 'Starting location',
                  label: Text('From'),
                  prefixIcon: Icon(Icons.location_on),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Enter starting location';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.md),

              TextFormField(
                controller: destinationController,
                decoration: const InputDecoration(
                  hintText: 'Destination',
                  label: Text('To'),
                  prefixIcon: Icon(Icons.location_on),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Enter destination';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Trip details section
              Text('Trip Details', style: AppTypography.headingMedium),
              const SizedBox(height: AppSpacing.md),

              ListTile(
                leading: const Icon(Icons.access_time),
                title: Text(
                  departureTime != null
                      ? '${departureTime!.day}/${departureTime!.month}/${departureTime!.year} ${departureTime!.hour}:${departureTime!.minute.toString().padLeft(2, '0')}'
                      : 'Select departure time',
                ),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => _selectDateTime(context),
                tileColor: AppColors.surfaceVariant,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: costController,
                      decoration: const InputDecoration(
                        hintText: 'Per seat cost',
                        label: Text('Cost (₹)'),
                        prefixIcon: Icon(Icons.currency_rupee),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Enter cost';
                        }
                        if (int.tryParse(value!) == null) {
                          return 'Enter valid number';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: TextFormField(
                      controller: seatsController,
                      decoration: const InputDecoration(
                        hintText: 'Available seats',
                        label: Text('Seats'),
                        prefixIcon: Icon(Icons.person),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Enter seats';
                        }
                        if (int.tryParse(value!) == null) {
                          return 'Enter valid number';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Options section
              Text('Options', style: AppTypography.headingMedium),
              const SizedBox(height: AppSpacing.md),

              CheckboxListTile(
                title: const Text('Women only'),
                subtitle: const Text('Only female passengers'),
                value: womenOnly,
                onChanged: (value) {
                  setState(() {
                    womenOnly = value ?? false;
                  });
                },
                controlAffinity: ListTileControlAffinity.leading,
              ),
              const SizedBox(height: AppSpacing.xl),

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: createState.isLoading ? null : _submitForm,
                  child: createState.isLoading
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
                      : const Text('Post Trip'),
                ),
              ),

              if (createState.hasError)
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.md),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.error),
                    ),
                    child: Text(
                      'Error posting trip. Please try again.',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.error,
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
