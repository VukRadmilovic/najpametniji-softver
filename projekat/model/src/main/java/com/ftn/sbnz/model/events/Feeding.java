package com.ftn.sbnz.model.events;

import com.ftn.sbnz.model.enums.AnimalType;
import com.ftn.sbnz.model.models.Shelter;
import org.kie.api.definition.type.Role;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Role(Role.Type.EVENT)
public class Feeding extends Event{
    private AnimalType animalType;

    public Feeding(LocalDateTime timestamp,
                   Shelter shelter,
                   AnimalType animalType) {
        super(timestamp, shelter);
        this.animalType = animalType;
    }

    public Feeding(long timestampLong,
                   Shelter shelter,
                   AnimalType animalType) {
        super(LocalDateTime.ofInstant(Instant.ofEpochMilli(timestampLong), ZoneId.systemDefault()), shelter);
        this.animalType = animalType;
    }

    public AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(AnimalType animalType) {
        this.animalType = animalType;
    }
}
