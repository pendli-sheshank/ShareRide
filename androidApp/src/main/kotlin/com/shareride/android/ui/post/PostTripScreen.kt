package com.shareride.android.ui.post

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostTripScreen(onBack: () -> Unit) {
    var origin by remember { mutableStateOf("") }
    var destination by remember { mutableStateOf("") }
    var departDate by remember { mutableStateOf("") }
    var seats by remember { mutableStateOf("") }
    var costEstimate by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Post a Ride") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = origin,
                onValueChange = { origin = it },
                label = { Text("From (origin)") },
                placeholder = { Text("e.g. Columbus, OH") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )

            OutlinedTextField(
                value = destination,
                onValueChange = { destination = it },
                label = { Text("To (destination)") },
                placeholder = { Text("e.g. Chicago, IL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )

            OutlinedTextField(
                value = departDate,
                onValueChange = { departDate = it },
                label = { Text("Departure date & time") },
                placeholder = { Text("e.g. 2026-07-04 09:00") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = seats,
                    onValueChange = { seats = it },
                    label = { Text("Seats") },
                    placeholder = { Text("3") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                )
                OutlinedTextField(
                    value = costEstimate,
                    onValueChange = { costEstimate = it },
                    label = { Text("Est. cost ($)") },
                    placeholder = { Text("25") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                )
            }

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes (optional)") },
                placeholder = { Text("Meeting point, luggage limits, etc.") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                maxLines = 4,
            )

            Text(
                text = "Cost contributions cover trip expenses only. Cash is exchanged in person.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.outline,
            )

            Button(
                onClick = { /* TODO: submit offer via ViewModel */ },
                enabled = origin.isNotBlank() && destination.isNotBlank() && departDate.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) {
                Text("Post Ride")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
