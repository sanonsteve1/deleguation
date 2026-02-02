package com.eburtis.abproject.socle.utils;

import org.apache.commons.lang3.StringUtils;

import java.util.LinkedHashSet;

public class NonNullSet<T> extends LinkedHashSet<T> {
	@Override
	public boolean add(T t) {
		if (t != null && StringUtils.isNotBlank(t.toString())) {
			return super.add(t);
		}
		return false;
	}
}
