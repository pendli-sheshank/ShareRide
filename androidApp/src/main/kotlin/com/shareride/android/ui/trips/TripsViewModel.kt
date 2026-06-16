package com.shareride.android.ui.trips

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shareride.model.TripOffer
import com.shareride.repository.TripRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TripsViewModel @Inject constructor(
    private val tripRepository: TripRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<TripsUiState>(TripsUiState.Loading)
    val uiState: StateFlow<TripsUiState> = _uiState.asStateFlow()

    init { loadTrips() }

    fun loadTrips() {
        viewModelScope.launch {
            _uiState.value = TripsUiState.Loading
            tripRepository.getUpcomingOffers()
                .onSuccess { _uiState.value = TripsUiState.Success(it) }
                .onFailure { _uiState.value = TripsUiState.Error(it.message ?: "Failed to load rides") }
        }
    }
}

sealed class TripsUiState {
    object Loading : TripsUiState()
    data class Success(val offers: List<TripOffer>) : TripsUiState()
    data class Error(val message: String) : TripsUiState()
}
